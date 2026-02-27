import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../../common/enums';

export class ChangeAppointmentStatusDto {
  @ApiProperty({
    description: 'New appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
