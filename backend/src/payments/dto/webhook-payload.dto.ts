import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WebhookEventType {
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',
}

export class WebhookPayloadDto {
  @ApiProperty({
    description: 'Webhook event type',
    enum: WebhookEventType,
  })
  @IsEnum(WebhookEventType)
  event_type: WebhookEventType;

  @ApiProperty({
    description: 'Transaction ID from AbakatePay',
    example: 'txn_123456789',
  })
  @IsString()
  transaction_id: string;

  @ApiProperty({
    description: 'Payment amount in BRL',
    example: 150.00,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Payment method (pix, card, etc)',
    example: 'pix',
  })
  @IsString()
  payment_method: string;

  @ApiProperty({
    description: 'Refund ID (for refund events)',
    example: 'ref_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  refund_id?: string;

  @ApiProperty({
    description: 'Error message (for failed events)',
    example: 'Card declined',
    required: false,
  })
  @IsOptional()
  @IsString()
  error_message?: string;

  @ApiProperty({
    description: 'Timestamp when event occurred (ISO 8601)',
    example: '2026-02-27T15:30:00Z',
  })
  @IsString()
  timestamp: string;
}
