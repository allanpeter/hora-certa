import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { RemindersService } from './reminders.service';

@Processor('reminders')
@Injectable()
export class RemindersProcessor {
  private readonly logger = new Logger(RemindersProcessor.name);

  constructor(private remindersService: RemindersService) {}

  @Process('send-reminder')
  async handleSendReminder(job: Job<{ appointmentId: string }>): Promise<void> {
    this.logger.log(
      `Processing reminder job for appointment ${job.data.appointmentId}`,
    );

    try {
      await this.remindersService.processReminderJob(job.data);
      this.logger.log(`Reminder job completed for ${job.data.appointmentId}`);
    } catch (error) {
      this.logger.error(
        `Reminder job failed for ${job.data.appointmentId}: ${(error as any).message}`,
      );
      throw error; // Will trigger retries based on job configuration
    }
  }
}
