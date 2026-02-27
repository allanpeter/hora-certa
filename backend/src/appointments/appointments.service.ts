import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../database/entities/appointment.entity';
import { Customer } from '../database/entities/customer.entity';
import { Barber } from '../database/entities/barber.entity';
import { Service } from '../database/entities/service.entity';
import { AppointmentStatus, PaymentStatus } from '../common/enums';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentResponseDto,
} from './dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Barber)
    private barberRepository: Repository<Barber>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  /**
   * Optional: Set reminders service for appointment booking
   * This is injected via the AppointmentsModule to avoid circular dependencies
   */
  setRemindersService(remindersService: any) {
    this.remindersService = remindersService;
  }

  private remindersService: any;

  async createAppointment(
    userId: string,
    tenantId: string,
    dto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    // Get or create customer
    let customer = await this.customerRepository.findOne({
      where: {
        tenant_id: tenantId,
        user_id: userId,
      },
    });

    if (!customer) {
      // Create customer from user data (minimal)
      customer = this.customerRepository.create({
        tenant_id: tenantId,
        user_id: userId,
        name: dto.customer_name || 'Customer',
        email: dto.customer_email,
        phone: dto.customer_phone,
      });
      await this.customerRepository.save(customer);
    }

    // Validate barber exists
    const barber = await this.barberRepository.findOne({
      where: {
        id: dto.barber_id,
        tenant_id: tenantId,
      },
    });

    if (!barber) {
      throw new NotFoundException('Barber not found');
    }

    // Validate service exists
    const service = await this.serviceRepository.findOne({
      where: {
        id: dto.service_id,
        tenant_id: tenantId,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Validate appointment times
    const scheduledStart = new Date(dto.scheduled_start);
    const scheduledEnd = new Date(dto.scheduled_end);

    if (scheduledStart >= scheduledEnd) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (scheduledStart < new Date()) {
      throw new BadRequestException('Cannot book appointments in the past');
    }

    // Verify duration matches service duration
    const durationMinutes =
      (scheduledEnd.getTime() - scheduledStart.getTime()) / 60000;
    if (durationMinutes !== service.duration_minutes) {
      throw new BadRequestException(
        `Appointment duration must match service duration (${service.duration_minutes} minutes)`,
      );
    }

    // Check for conflicts with existing appointments
    const conflictingAppointment = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.barber_id = :barberId', { barberId: dto.barber_id })
      .andWhere('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.scheduled_start < :scheduledEnd', { scheduledEnd })
      .andWhere('a.scheduled_end > :scheduledStart', { scheduledStart })
      .andWhere('a.status IN (:...statuses)', {
        statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
      })
      .getOne();

    if (conflictingAppointment) {
      throw new ConflictException(
        'Time slot is not available for this barber',
      );
    }

    // Create appointment
    const appointment = this.appointmentRepository.create({
      tenant_id: tenantId,
      barber_id: dto.barber_id,
      customer_id: customer.id,
      service_id: dto.service_id,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      status: AppointmentStatus.SCHEDULED,
      payment_status: PaymentStatus.PENDING,
      notes: dto.notes,
    });

    const saved = await this.appointmentRepository.save(appointment);

    // Schedule reminder for 24h before appointment
    if (this.remindersService) {
      this.remindersService.scheduleReminder(saved.id).catch((error: any) => {
        console.error(`Failed to schedule reminder for appointment ${saved.id}`, error);
      });
    }

    return this.formatResponse(saved);
  }

  async getAppointments(
    userId: string,
    tenantId: string,
    filters?: {
      status?: AppointmentStatus;
      barber_id?: string;
      customer_id?: string;
      from_date?: Date;
      to_date?: Date;
    },
  ): Promise<AppointmentResponseDto[]> {
    const query = this.appointmentRepository.createQueryBuilder('a');

    query.where('a.tenant_id = :tenantId', { tenantId });

    // Only show appointments related to the user
    // (as barber or through customer)
    const userBarber = await this.barberRepository.findOne({
      where: {
        tenant_id: tenantId,
        user_id: userId,
      },
    });

    const userCustomer = await this.customerRepository.findOne({
      where: {
        tenant_id: tenantId,
        user_id: userId,
      },
    });

    if (!userBarber && !userCustomer) {
      return [];
    }

    const orConditions = [];

    if (userBarber) {
      orConditions.push('a.barber_id = :barberId');
    }
    if (userCustomer) {
      orConditions.push('a.customer_id = :customerId');
    }

    if (orConditions.length > 0) {
      const params: any = {};
      if (userBarber) params.barberId = userBarber.id;
      if (userCustomer) params.customerId = userCustomer.id;

      query.andWhere(`(${orConditions.join(' OR ')})`, params);
    }

    if (filters?.status) {
      query.andWhere('a.status = :status', { status: filters.status });
    }

    if (filters?.barber_id) {
      query.andWhere('a.barber_id = :barberId', {
        barberId: filters.barber_id,
      });
    }

    if (filters?.customer_id) {
      query.andWhere('a.customer_id = :customerId', {
        customerId: filters.customer_id,
      });
    }

    if (filters?.from_date) {
      query.andWhere('a.scheduled_start >= :fromDate', {
        fromDate: filters.from_date,
      });
    }

    if (filters?.to_date) {
      query.andWhere('a.scheduled_end <= :toDate', {
        toDate: filters.to_date,
      });
    }

    const appointments = await query
      .leftJoinAndSelect('a.barber', 'barber')
      .leftJoinAndSelect('a.customer', 'customer')
      .leftJoinAndSelect('a.service', 'service')
      .orderBy('a.scheduled_start', 'ASC')
      .getMany();

    return appointments.map((a) => this.formatResponse(a));
  }

  async getAppointmentById(
    appointmentId: string,
    tenantId: string,
    userId: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: appointmentId,
        tenant_id: tenantId,
      },
      relations: ['barber', 'customer', 'service', 'barber.user', 'customer.user'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check if user has access (is barber or customer)
    const hasAccess =
      appointment.barber?.user_id === userId ||
      appointment.customer?.user_id === userId;

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this appointment',
      );
    }

    return this.formatResponse(appointment);
  }

  async updateAppointmentStatus(
    appointmentId: string,
    tenantId: string,
    userId: string,
    status: AppointmentStatus,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: appointmentId,
        tenant_id: tenantId,
      },
      relations: ['barber', 'barber.user'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Only barber can change status
    if (appointment.barber?.user_id !== userId) {
      throw new ForbiddenException(
        'Only the assigned barber can update appointment status',
      );
    }

    // Validate status transitions
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.SCHEDULED]: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CANCELLED,
      ],
      [AppointmentStatus.CONFIRMED]: [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.NO_SHOW,
        AppointmentStatus.CANCELLED,
      ],
      [AppointmentStatus.COMPLETED]: [],
      [AppointmentStatus.CANCELLED]: [],
      [AppointmentStatus.NO_SHOW]: [],
    };

    if (!validTransitions[appointment.status].includes(status)) {
      throw new BadRequestException(
        `Cannot change status from ${appointment.status} to ${status}`,
      );
    }

    appointment.status = status;
    const updated = await this.appointmentRepository.save(appointment);

    return this.formatResponse(updated);
  }

  async rescheduleAppointment(
    appointmentId: string,
    tenantId: string,
    userId: string,
    dto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: appointmentId,
        tenant_id: tenantId,
      },
      relations: ['barber', 'customer', 'service', 'barber.user', 'customer.user'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Customer or barber can reschedule
    const isCustomer = appointment.customer?.user_id === userId;
    const isBarber = appointment.barber?.user_id === userId;

    if (!isCustomer && !isBarber) {
      throw new ForbiddenException(
        'You do not have permission to reschedule this appointment',
      );
    }

    // Can only reschedule SCHEDULED or CONFIRMED appointments
    if (
      ![AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(
        appointment.status,
      )
    ) {
      throw new BadRequestException(
        'Cannot reschedule an appointment with status ' + appointment.status,
      );
    }

    const newStart = new Date(dto.scheduled_start);
    const newEnd = new Date(dto.scheduled_end);

    // Validate new times
    if (newStart >= newEnd) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (newStart < new Date()) {
      throw new BadRequestException('Cannot schedule in the past');
    }

    // Check service duration matches
    const durationMinutes =
      (newEnd.getTime() - newStart.getTime()) / 60000;
    if (durationMinutes !== appointment.service.duration_minutes) {
      throw new BadRequestException(
        `Appointment duration must match service duration (${appointment.service.duration_minutes} minutes)`,
      );
    }

    // Check for conflicts (excluding this appointment)
    const conflictingAppointment = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.barber_id = :barberId', { barberId: appointment.barber_id })
      .andWhere('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.id != :appointmentId', { appointmentId })
      .andWhere('a.scheduled_start < :newEnd', { newEnd })
      .andWhere('a.scheduled_end > :newStart', { newStart })
      .andWhere('a.status IN (:...statuses)', {
        statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
      })
      .getOne();

    if (conflictingAppointment) {
      throw new ConflictException(
        'New time slot is not available for this barber',
      );
    }

    appointment.scheduled_start = newStart;
    appointment.scheduled_end = newEnd;

    const updated = await this.appointmentRepository.save(appointment);
    return this.formatResponse(updated);
  }

  async cancelAppointment(
    appointmentId: string,
    tenantId: string,
    userId: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: appointmentId,
        tenant_id: tenantId,
      },
      relations: ['barber', 'customer', 'barber.user', 'customer.user'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Customer or barber can cancel
    const isCustomer = appointment.customer?.user_id === userId;
    const isBarber = appointment.barber?.user_id === userId;

    if (!isCustomer && !isBarber) {
      throw new ForbiddenException(
        'You do not have permission to cancel this appointment',
      );
    }

    // Can only cancel SCHEDULED or CONFIRMED
    if (
      ![AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(
        appointment.status,
      )
    ) {
      throw new BadRequestException(
        'Cannot cancel an appointment with status ' + appointment.status,
      );
    }

    appointment.status = AppointmentStatus.CANCELLED;
    const updated = await this.appointmentRepository.save(appointment);

    return this.formatResponse(updated);
  }

  private formatResponse(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id,
      barber_id: appointment.barber_id,
      customer_id: appointment.customer_id,
      service_id: appointment.service_id,
      scheduled_start: appointment.scheduled_start.toISOString(),
      scheduled_end: appointment.scheduled_end.toISOString(),
      status: appointment.status,
      payment_status: appointment.payment_status,
      payment_id: appointment.payment_id,
      notes: appointment.notes,
      created_at: appointment.created_at.toISOString(),
      updated_at: appointment.updated_at.toISOString(),
      barber: appointment.barber,
      customer: appointment.customer,
      service: appointment.service,
    };
  }
}
