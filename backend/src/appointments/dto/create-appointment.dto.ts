import { IsUUID, IsISO8601, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Barber UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  barber_id: string;

  @ApiProperty({
    description: 'Service UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  service_id: string;

  @ApiProperty({
    description: 'Appointment start time (ISO 8601)',
    example: '2026-03-15T10:00:00Z',
  })
  @IsISO8601()
  scheduled_start: string;

  @ApiProperty({
    description: 'Appointment end time (ISO 8601)',
    example: '2026-03-15T10:30:00Z',
  })
  @IsISO8601()
  scheduled_end: string;

  @ApiProperty({
    description: 'Customer name (if not authenticated user)',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  customer_name?: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'joao@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  customer_email?: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '11987654321',
    required: false,
  })
  @IsOptional()
  @IsString()
  customer_phone?: string;

  @ApiProperty({
    description: 'Additional notes for the appointment',
    example: 'First time customer, prefers fade cut',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
