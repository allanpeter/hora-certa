import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ReschedulingService } from './rescheduling.service';

@Processor('rescheduling')
@Injectable()
export class ReschedulingProcessor {
  private readonly logger = new Logger(ReschedulingProcessor.name);

  constructor(private reschedulingService: ReschedulingService) {}

  @Process('auto-release')
  async handleAutoRelease(job: Job<{ appointmentId: string }>): Promise<void> {
    this.logger.log(
      `Processing auto-release job for appointment ${job.data.appointmentId}`,
    );

    try {
      await this.reschedulingService.processAutoReleaseJob(job.data);
      this.logger.log(
        `Auto-release job completed for ${job.data.appointmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Auto-release job failed for ${job.data.appointmentId}: ${(error as any).message}`,
      );
      throw error;
    }
  }

  @Process('expire-offer')
  async handleExpireOffer(job: Job<{ waitlistId: string }>): Promise<void> {
    this.logger.log(`Processing offer expiration for waitlist ${job.data.waitlistId}`);

    try {
      await this.reschedulingService.processExpireOfferJob(job.data);
      this.logger.log(`Offer expiration job completed for ${job.data.waitlistId}`);
    } catch (error) {
      this.logger.error(
        `Offer expiration job failed for ${job.data.waitlistId}: ${(error as any).message}`,
      );
      throw error;
    }
  }
}
