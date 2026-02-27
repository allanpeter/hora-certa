import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus, PaymentStatus } from '../../common/enums';
import { Barber } from '../../database/entities/barber.entity';
import { Customer } from '../../database/entities/customer.entity';
import { Service } from '../../database/entities/service.entity';

export class AppointmentResponseDto {
  @ApiProperty({
    description: 'Appointment UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Barber UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  barber_id: string;

  @ApiProperty({
    description: 'Customer UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  customer_id: string;

  @ApiProperty({
    description: 'Service UUID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  service_id: string;

  @ApiProperty({
    description: 'Appointment start time (ISO 8601)',
    example: '2026-03-15T10:00:00Z',
  })
  scheduled_start: string;

  @ApiProperty({
    description: 'Appointment end time (ISO 8601)',
    example: '2026-03-15T10:30:00Z',
  })
  scheduled_end: string;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
  })
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
  })
  payment_status: PaymentStatus;

  @ApiProperty({
    description: 'Payment UUID (if exists)',
    example: '550e8400-e29b-41d4-a716-446655440004',
    nullable: true,
  })
  payment_id: string | null;

  @ApiProperty({
    description: 'Appointment notes',
    example: 'Customer prefers fade cut',
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({
    description: 'Creation timestamp (ISO 8601)',
    example: '2026-02-27T10:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Last update timestamp (ISO 8601)',
    example: '2026-02-27T10:00:00Z',
  })
  updated_at: string;

  @ApiProperty({
    description: 'Barber details',
    type: Object,
    nullable: true,
  })
  barber?: Barber;

  @ApiProperty({
    description: 'Customer details',
    type: Object,
    nullable: true,
  })
  customer?: Customer;

  @ApiProperty({
    description: 'Service details',
    type: Object,
    nullable: true,
  })
  service?: Service;
}
