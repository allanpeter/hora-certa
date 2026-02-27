import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../database/entities/appointment.entity';
import { Waitlist } from '../database/entities/waitlist.entity';
import { Customer } from '../database/entities/customer.entity';
import { Barber } from '../database/entities/barber.entity';
import { Service } from '../database/entities/service.entity';
import { ReschedulingService } from './rescheduling.service';
import { ReschedulingController } from './rescheduling.controller';
import { ReschedulingProcessor } from './rescheduling.processor';
import { AvailabilityModule } from '../availability/availability.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Waitlist, Customer, Barber, Service]),
    BullModule.registerQueue({
      name: 'rescheduling',
    }),
    forwardRef(() => AvailabilityModule),
    forwardRef(() => RemindersModule),
  ],
  controllers: [ReschedulingController],
  providers: [ReschedulingService, ReschedulingProcessor],
  exports: [ReschedulingService],
})
export class ReschedulingModule {}
