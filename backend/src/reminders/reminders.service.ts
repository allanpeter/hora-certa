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
import { ConfigService } from '@nestjs/config';
import { Appointment } from '../database/entities/appointment.entity';
import { AppointmentStatus } from '../common/enums';
import { EmailService } from './email.service';
import crypto from 'crypto';

export interface ReminderToken {
  appointmentId: string;
  action: 'confirm' | 'decline';
  expiresAt: number;
  signature: string;
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);
  private readonly tokenSecret: string;

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectQueue('reminders')
    private remindersQueue: Queue,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.tokenSecret = this.configService.get<string>('REMINDER_TOKEN_SECRET') || 'secret';
  }

  /**
   * Schedule a reminder for an appointment
   * Called after appointment is booked
   */
  async scheduleReminder(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['customer', 'service', 'barber'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Calculate delay: 24 hours before appointment
    const appointmentTime = appointment.scheduled_start.getTime();
    const reminderTime = appointmentTime - 24 * 60 * 60 * 1000; // 24h before
    const delayMs = reminderTime - Date.now();

    if (delayMs <= 0) {
      this.logger.warn(
        `Appointment ${appointmentId} is less than 24h away, sending reminder immediately`,
      );
      // Send immediately if less than 24h away
      await this.sendReminder(appointmentId);
      return;
    }

    // Schedule job for 24h before
    await this.remindersQueue.add(
      'send-reminder',
      { appointmentId },
      {
        delay: delayMs,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 seconds
        },
        removeOnComplete: true,
      },
    );

    this.logger.log(
      `Reminder scheduled for appointment ${appointmentId} in ${Math.round(delayMs / 1000 / 60)} minutes`,
    );
  }

  /**
   * Send reminder email to customer
   */
  async sendReminder(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['customer', 'service', 'barber', 'barber.user'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Generate confirmation and decline tokens
    const confirmToken = this.generateToken(appointmentId, 'confirm');
    const declineToken = this.generateToken(appointmentId, 'decline');

    // Get frontend URL
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const confirmUrl = `${frontendUrl}/appointments/${appointmentId}/confirm?token=${confirmToken}`;
    const declineUrl = `${frontendUrl}/appointments/${appointmentId}/decline?token=${declineToken}`;

    try {
      await this.emailService.sendReminderEmail({
        to: appointment.customer.email,
        customerName: appointment.customer.name,
        barberName: appointment.barber?.user?.name || 'Barber',
        serviceName: appointment.service.name,
        serviceDuration: appointment.service.duration_minutes,
        appointmentTime: appointment.scheduled_start,
        confirmUrl,
        declineUrl,
      });

      // Update reminder_sent_at
      appointment.reminder_sent_at = new Date();
      await this.appointmentRepository.save(appointment);

      this.logger.log(`Reminder sent for appointment ${appointmentId}`);
    } catch (error) {
      this.logger.error(`Failed to send reminder for ${appointmentId}`, error);
      throw error;
    }
  }

  /**
   * Handle appointment confirmation
   */
  async confirmAppointment(
    appointmentId: string,
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify token
    const isValid = this.verifyToken(appointmentId, token, 'confirm');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired confirmation token');
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException(
        `Cannot confirm appointment with status ${appointment.status}`,
      );
    }

    // Mark as confirmed
    appointment.status = AppointmentStatus.CONFIRMED;
    await this.appointmentRepository.save(appointment);

    this.logger.log(`Appointment ${appointmentId} confirmed by customer`);

    return {
      success: true,
      message: 'Appointment confirmed successfully',
    };
  }

  /**
   * Handle appointment decline/cancellation
   */
  async declineAppointment(
    appointmentId: string,
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify token
    const isValid = this.verifyToken(appointmentId, token, 'decline');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired decline token');
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (
      ![AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(
        appointment.status,
      )
    ) {
      throw new BadRequestException(
        `Cannot decline appointment with status ${appointment.status}`,
      );
    }

    // Mark as cancelled
    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentRepository.save(appointment);

    this.logger.log(`Appointment ${appointmentId} declined by customer`);

    // TODO: Task #10 - Add to waitlist if exists
    // TODO: Task #10 - Notify others on waitlist

    return {
      success: true,
      message: 'Appointment cancelled successfully',
    };
  }

  /**
   * Generate secure confirmation token
   */
  private generateToken(appointmentId: string, action: 'confirm' | 'decline'): string {
    // Token expires in 24 hours
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    const tokenData: Omit<ReminderToken, 'signature'> = {
      appointmentId,
      action,
      expiresAt,
    };

    const tokenJson = JSON.stringify(tokenData);
    const signature = crypto
      .createHmac('sha256', this.tokenSecret)
      .update(tokenJson)
      .digest('hex');

    const fullToken: ReminderToken = { ...tokenData, signature };

    // Return base64-encoded token
    return Buffer.from(JSON.stringify(fullToken)).toString('base64');
  }

  /**
   * Verify confirmation token
   */
  private verifyToken(
    appointmentId: string,
    tokenString: string,
    expectedAction: 'confirm' | 'decline',
  ): boolean {
    try {
      const tokenJson = Buffer.from(tokenString, 'base64').toString('utf-8');
      const token: ReminderToken = JSON.parse(tokenJson);

      // Check appointment ID
      if (token.appointmentId !== appointmentId) {
        return false;
      }

      // Check action
      if (token.action !== expectedAction) {
        return false;
      }

      // Check expiration
      if (token.expiresAt < Date.now()) {
        return false;
      }

      // Verify signature
      const tokenDataJson = JSON.stringify({
        appointmentId: token.appointmentId,
        action: token.action,
        expiresAt: token.expiresAt,
      });

      const expectedSignature = crypto
        .createHmac('sha256', this.tokenSecret)
        .update(tokenDataJson)
        .digest('hex');

      return token.signature === expectedSignature;
    } catch (error) {
      this.logger.error('Token verification failed', error);
      return false;
    }
  }

  /**
   * Process reminder queue job
   * Called by Bull job processor
   */
  async processReminderJob(data: { appointmentId: string }): Promise<void> {
    await this.sendReminder(data.appointmentId);
  }

  /**
   * Get appointment reminder status
   */
  async getReminderStatus(appointmentId: string): Promise<{
    appointmentId: string;
    reminderSentAt: Date | null;
    status: AppointmentStatus;
    canConfirm: boolean;
    canDecline: boolean;
  }> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return {
      appointmentId,
      reminderSentAt: appointment.reminder_sent_at,
      status: appointment.status,
      canConfirm: appointment.status === AppointmentStatus.SCHEDULED,
      canDecline: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(
        appointment.status,
      ),
    };
  }

  /**
   * List pending reminders (for manual processing if needed)
   */
  async getPendingReminders(): Promise<Appointment[]> {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    const today = new Date();
    today.setHours(today.getHours() + 23);

    return this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.scheduled_start BETWEEN :today AND :tomorrow', {
        today,
        tomorrow,
      })
      .andWhere('a.status IN (:...statuses)', {
        statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
      })
      .andWhere('a.reminder_sent_at IS NULL')
      .leftJoinAndSelect('a.customer', 'customer')
      .leftJoinAndSelect('a.service', 'service')
      .leftJoinAndSelect('a.barber', 'barber')
      .orderBy('a.scheduled_start', 'ASC')
      .getMany();
  }
}
