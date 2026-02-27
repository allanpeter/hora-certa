import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../database/entities/appointment.entity';
import { Customer } from '../database/entities/customer.entity';
import { Barber } from '../database/entities/barber.entity';
import { Service } from '../database/entities/service.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Customer, Barber, Service]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
