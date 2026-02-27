import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../../common/enums';

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Appointment UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  appointment_id: string;

  @ApiProperty({
    description: 'Payment amount in BRL',
    example: 150.00,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'External payment ID from AbakatePay',
    example: 'txn_123456789',
    nullable: true,
  })
  external_id: string | null;

  @ApiProperty({
    description: 'When payment was completed (ISO 8601)',
    example: '2026-02-27T15:30:00Z',
    nullable: true,
  })
  paid_at: string | null;

  @ApiProperty({
    description: 'Created timestamp (ISO 8601)',
    example: '2026-02-27T15:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Updated timestamp (ISO 8601)',
    example: '2026-02-27T15:30:00Z',
  })
  updated_at: string;
}

export class PIXPaymentResponseDto {
  @ApiProperty({
    description: 'Payment UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  payment_id: string;

  @ApiProperty({
    description: 'AbakatePay transaction ID',
    example: 'txn_123456789',
  })
  transaction_id: string;

  @ApiProperty({
    description: 'Payment amount in BRL',
    example: 150.00,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @ApiProperty({
    description: 'QR code as base64 string',
    example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  })
  qr_code: string;

  @ApiProperty({
    description: 'QR code image URL',
    example: 'https://api.example.com/qr/123456',
  })
  qr_code_url: string;

  @ApiProperty({
    description: 'PIX key (chave aleatória)',
    example: 'abc123def456',
  })
  pix_key: string;

  @ApiProperty({
    description: 'QR code expiration time (ISO 8601)',
    example: '2026-02-27T16:00:00Z',
  })
  expires_at: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
  })
  status: PaymentStatus;
}

export class CardPaymentResponseDto {
  @ApiProperty({
    description: 'Payment UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  payment_id: string;

  @ApiProperty({
    description: 'Payment intent ID from AbakatePay',
    example: 'pi_123456789',
  })
  payment_intent_id: string;

  @ApiProperty({
    description: 'Payment amount in BRL',
    example: 150.00,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @ApiProperty({
    description: 'Number of installments',
    example: 3,
  })
  installments: number;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'URL to redirect customer for card payment',
    example: 'https://pay.example.com/checkout/pi_123456789',
  })
  payment_url: string;
}
