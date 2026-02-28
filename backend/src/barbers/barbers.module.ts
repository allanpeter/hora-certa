import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarbersController } from './barbers.controller';
import { BarbersService } from './barbers.service';
import { Barber } from '../database/entities/barber.entity';
import { User } from '../database/entities/user.entity';
import { Tenant } from '../database/entities/tenant.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { TenantUser } from '../database/entities/tenant-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Barber, User, Tenant, Appointment, TenantUser])],
  controllers: [BarbersController],
  providers: [BarbersService],
  exports: [BarbersService],
})
export class BarbersModule {}
