import { IsISO8601, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppointmentDto {
  @ApiProperty({
    description: 'New appointment start time (ISO 8601)',
    example: '2026-03-15T10:00:00Z',
  })
  @IsISO8601()
  scheduled_start: string;

  @ApiProperty({
    description: 'New appointment end time (ISO 8601)',
    example: '2026-03-15T10:30:00Z',
  })
  @IsISO8601()
  scheduled_end: string;

  @ApiProperty({
    description: 'Updated notes for the appointment',
    example: 'Customer prefers shorter cut',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
