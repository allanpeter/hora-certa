import { IsUUID, IsNumber, IsOptional, IsPositive, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Appointment UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  appointment_id: string;

  @ApiProperty({
    description: 'Payment amount in BRL',
    example: 150.00,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Number of installments (for card payments)',
    example: 1,
    required: false,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  installments?: number;

  @ApiProperty({
    description: 'Return URL after card payment',
    example: 'https://example.com/payment/callback',
    required: false,
  })
  @IsOptional()
  return_url?: string;
}
