import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { Appointment } from '../database/entities/appointment.entity';
import { Waitlist, WaitlistStatus } from '../database/entities/waitlist.entity';
import { Customer } from '../database/entities/customer.entity';
import { Barber } from '../database/entities/barber.entity';
import { Service } from '../database/entities/service.entity';
import { AppointmentStatus } from '../common/enums';
import { EmailService } from '../reminders/email.service';

@Injectable()
export class ReschedulingService {
  private readonly logger = new Logger(ReschedulingService.name);

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Waitlist)
    private waitlistRepository: Repository<Waitlist>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Barber)
    private barberRepository: Repository<Barber>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectQueue('rescheduling')
    private reschedulingQueue: Queue,
    private emailService: EmailService,
  ) {}

  /**
   * Schedule auto-release job for 2 hours before appointment
   */
  async scheduleAutoRelease(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Calculate delay: 2 hours before appointment
    const appointmentTime = appointment.scheduled_start.getTime();
    const releaseTime = appointmentTime - 2 * 60 * 60 * 1000; // 2h before
    const delayMs = releaseTime - Date.now();

    if (delayMs <= 0) {
      this.logger.warn(
        `Appointment ${appointmentId} is less than 2h away, skipping auto-release scheduling`,
      );
      return;
    }

    // Schedule job for 2h before
    await this.reschedulingQueue.add(
      'auto-release',
      { appointmentId },
      {
        delay: delayMs,
        attempts: 1,
        removeOnComplete: true,
      },
    );

    this.logger.log(
      `Auto-release scheduled for appointment ${appointmentId} in ${Math.round(delayMs / 1000 / 60)} minutes`,
    );
  }

  /**
   * Auto-release appointment if not confirmed
   */
  async processAutoRelease(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['customer', 'barber', 'service'],
    });

    if (!appointment) {
      this.logger.warn(`Appointment ${appointmentId} not found for auto-release`);
      return;
    }

    // Only auto-release if still SCHEDULED (not confirmed or already released)
    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      this.logger.log(
        `Appointment ${appointmentId} is already ${appointment.status}, skipping auto-release`,
      );
      return;
    }

    // Release the slot
    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentRepository.save(appointment);

    this.logger.log(`Appointment ${appointmentId} auto-released (no confirmation)`);

    // Try to fill from waitlist
    await this.fillFromWaitlist(appointment);
  }

  /**
   * Add customer to waitlist
   */
  async addToWaitlist(
    tenantId: string,
    customerId: string,
    barberId: string,
    serviceId: string,
    notes?: string,
  ): Promise<Waitlist> {
    // Verify customer, barber, and service exist
    const [customer, barber, service] = await Promise.all([
      this.customerRepository.findOne({
        where: { id: customerId, tenant_id: tenantId },
      }),
      this.barberRepository.findOne({
        where: { id: barberId, tenant_id: tenantId },
      }),
      this.serviceRepository.findOne({
        where: { id: serviceId, tenant_id: tenantId },
      }),
    ]);

    if (!customer) throw new NotFoundException('Customer not found');
    if (!barber) throw new NotFoundException('Barber not found');
    if (!service) throw new NotFoundException('Service not found');

    // Check if already on waitlist
    const existing = await this.waitlistRepository.findOne({
      where: {
        tenant_id: tenantId,
        customer_id: customerId,
        barber_id: barberId,
        service_id: serviceId,
        status: WaitlistStatus.WAITING,
      },
    });

    if (existing) {
      throw new BadRequestException('Customer already on waitlist for this service');
    }

    // Get position in queue
    const queuePosition = await this.waitlistRepository.count({
      where: {
        tenant_id: tenantId,
        barber_id: barberId,
        status: WaitlistStatus.WAITING,
      },
    });

    const waitlist = this.waitlistRepository.create({
      tenant_id: tenantId,
      customer_id: customerId,
      barber_id: barberId,
      service_id: serviceId,
      status: WaitlistStatus.WAITING,
      requested_at: new Date(),
      position_in_queue: queuePosition + 1,
      notes,
    });

    await this.waitlistRepository.save(waitlist);

    this.logger.log(
      `Customer ${customerId} added to waitlist for barber ${barberId}, position ${waitlist.position_in_queue}`,
    );

    return waitlist;
  }

  /**
   * Get waitlist position for customer
   */
  async getWaitlistPosition(
    tenantId: string,
    customerId: string,
    barberId: string,
    serviceId: string,
  ): Promise<Waitlist | null> {
    return this.waitlistRepository.findOne({
      where: {
        tenant_id: tenantId,
        customer_id: customerId,
        barber_id: barberId,
        service_id: serviceId,
        status: WaitlistStatus.WAITING,
      },
    });
  }

  /**
   * Remove from waitlist
   */
  async removeFromWaitlist(
    tenantId: string,
    customerId: string,
    barberId: string,
    serviceId: string,
  ): Promise<void> {
    const waitlist = await this.waitlistRepository.findOne({
      where: {
        tenant_id: tenantId,
        customer_id: customerId,
        barber_id: barberId,
        service_id: serviceId,
        status: WaitlistStatus.WAITING,
      },
    });

    if (!waitlist) {
      throw new NotFoundException('Not on waitlist');
    }

    waitlist.status = WaitlistStatus.CANCELLED;
    await this.waitlistRepository.save(waitlist);

    // Reorder queue positions
    await this.reorderQueuePositions(tenantId, barberId);

    this.logger.log(
      `Customer ${customerId} removed from waitlist for barber ${barberId}`,
    );
  }

  /**
   * Try to fill released slot from waitlist
   */
  private async fillFromWaitlist(releasedAppointment: Appointment): Promise<void> {
    // Get first customer on waitlist for this service and barber
    const waitlistCustomer = await this.waitlistRepository.findOne({
      where: {
        tenant_id: releasedAppointment.tenant_id,
        barber_id: releasedAppointment.barber_id,
        service_id: releasedAppointment.service_id,
        status: WaitlistStatus.WAITING,
      },
      order: { position_in_queue: 'ASC' },
      relations: ['customer'],
    });

    if (!waitlistCustomer) {
      this.logger.log(`No waitlist customers for released slot`);
      return;
    }

    // Offer the released slot to waitlist customer
    await this.offerSlotToWaitlistCustomer(waitlistCustomer, releasedAppointment);
  }

  /**
   * Offer released slot to waitlist customer
   */
  private async offerSlotToWaitlistCustomer(
    waitlist: Waitlist,
    originalAppointment: Appointment,
  ): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id: waitlist.customer_id },
    });

    if (!customer || !customer.email) {
      this.logger.warn(`Cannot email customer ${waitlist.customer_id}`);
      return;
    }

    // Offer expires in 2 hours
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // Update waitlist with offered slot
    waitlist.status = WaitlistStatus.OFFERED;
    waitlist.slot_offered_at = new Date();
    waitlist.slot_available_date = originalAppointment.scheduled_start;
    waitlist.offered_slots = [
      {
        start: originalAppointment.scheduled_start.toISOString(),
        end: originalAppointment.scheduled_end.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    ];

    await this.waitlistRepository.save(waitlist);

    // Send email to waitlist customer
    try {
      await this.emailService.sendConfirmationEmail(
        customer.email,
        customer.name,
        originalAppointment.barber?.user?.name || 'Barber',
        originalAppointment.scheduled_start,
      );

      this.logger.log(
        `Offered slot to waitlist customer ${waitlist.customer_id}, expires at ${expiresAt.toISOString()}`,
      );

      // Schedule offer expiration
      await this.scheduleOfferExpiration(waitlist.id, 2 * 60 * 60 * 1000);
    } catch (error) {
      this.logger.error(`Failed to email waitlist customer`, error);
    }
  }

  /**
   * Schedule offer expiration (if customer doesn't accept)
   */
  private async scheduleOfferExpiration(waitlistId: string, delayMs: number): Promise<void> {
    await this.reschedulingQueue.add(
      'expire-offer',
      { waitlistId },
      {
        delay: delayMs,
        attempts: 1,
        removeOnComplete: true,
      },
    );
  }

  /**
   * Accept offered slot and create appointment
   */
  async acceptOfferedSlot(
    tenantId: string,
    customerId: string,
    _token?: string, // TODO: Implement token validation like in reminders
  ): Promise<Appointment> {
    const waitlist = await this.waitlistRepository.findOne({
      where: {
        tenant_id: tenantId,
        customer_id: customerId,
        status: WaitlistStatus.OFFERED,
      },
      relations: ['customer', 'barber', 'service'],
    });

    if (!waitlist) {
      throw new NotFoundException('No offered slot available');
    }

    // Check if offer expired
    if (
      waitlist.offered_slots &&
      waitlist.offered_slots.length > 0 &&
      new Date(waitlist.offered_slots[0].expiresAt) < new Date()
    ) {
      throw new BadRequestException('Offered slot has expired');
    }

    // Create appointment
    const slotStart = new Date(waitlist.slot_available_date);
    const slotEnd = new Date(
      slotStart.getTime() + waitlist.service.duration_minutes * 60000,
    );

    const appointment = this.appointmentRepository.create({
      tenant_id: tenantId,
      barber_id: waitlist.barber_id,
      customer_id: waitlist.customer_id,
      service_id: waitlist.service_id,
      scheduled_start: slotStart,
      scheduled_end: slotEnd,
      status: AppointmentStatus.CONFIRMED,
    });

    const saved = await this.appointmentRepository.save(appointment);

    // Update waitlist
    waitlist.status = WaitlistStatus.FULFILLED;
    waitlist.slot_confirmed_at = new Date();
    waitlist.resulting_appointment_id = saved.id;
    await this.waitlistRepository.save(waitlist);

    this.logger.log(
      `Waitlist customer ${customerId} accepted offered slot, created appointment ${saved.id}`,
    );

    return saved;
  }

  /**
   * Decline offered slot
   */
  async declineOfferedSlot(
    tenantId: string,
    customerId: string,
  ): Promise<void> {
    const waitlist = await this.waitlistRepository.findOne({
      where: {
        tenant_id: tenantId,
        customer_id: customerId,
        status: WaitlistStatus.OFFERED,
      },
    });

    if (!waitlist) {
      throw new NotFoundException('No offered slot');
    }

    // Keep on waitlist at end of queue
    waitlist.status = WaitlistStatus.WAITING;
    waitlist.slot_offered_at = undefined as any;
    waitlist.offered_slots = [];

    await this.waitlistRepository.save(waitlist);

    // Reorder queue
    await this.reorderQueuePositions(tenantId, waitlist.barber_id);

    this.logger.log(`Customer ${customerId} declined offered slot`);
  }

  /**
   * Reorder queue positions after removal or decline
   */
  private async reorderQueuePositions(tenantId: string, barberId: string): Promise<void> {
    const waitingCustomers = await this.waitlistRepository.find({
      where: {
        tenant_id: tenantId,
        barber_id: barberId,
        status: WaitlistStatus.WAITING,
      },
      order: { requested_at: 'ASC' },
    });

    for (let i = 0; i < waitingCustomers.length; i++) {
      waitingCustomers[i].position_in_queue = i + 1;
    }

    await this.waitlistRepository.save(waitingCustomers);
  }

  /**
   * Process job: auto-release appointment if not confirmed
   */
  async processAutoReleaseJob(data: { appointmentId: string }): Promise<void> {
    await this.processAutoRelease(data.appointmentId);
  }

  /**
   * Process job: expire offered slot
   */
  async processExpireOfferJob(data: { waitlistId: string }): Promise<void> {
    const waitlist = await this.waitlistRepository.findOne({
      where: { id: data.waitlistId },
    });

    if (!waitlist || waitlist.status !== WaitlistStatus.OFFERED) {
      return;
    }

    // Put back on waiting list
    waitlist.status = WaitlistStatus.NO_RESPONSE;
    await this.waitlistRepository.save(waitlist);

    this.logger.log(`Offer for waitlist ${data.waitlistId} expired, status set to NO_RESPONSE`);
  }

  /**
   * Get all appointments scheduled for release/confirmation
   */
  async getAppointmentsNeedingConfirmation(tenantId: string): Promise<Appointment[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);

    return this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.status = :status', { status: AppointmentStatus.SCHEDULED })
      .andWhere('a.scheduled_start BETWEEN :twentyFourHoursAgo AND :twoHoursFromNow', {
        twentyFourHoursAgo,
        twoHoursFromNow,
      })
      .leftJoinAndSelect('a.customer', 'customer')
      .leftJoinAndSelect('a.barber', 'barber')
      .orderBy('a.scheduled_start', 'ASC')
      .getMany();
  }
}
