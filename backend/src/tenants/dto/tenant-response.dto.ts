import { ApiProperty } from '@nestjs/swagger';

export class TenantResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'barber-shop-1' })
  slug: string;

  @ApiProperty({ example: 'João Silva Barbearia' })
  name: string;

  @ApiProperty({ example: 'Rua das Flores, 123, São Paulo, SP' })
  address?: string;

  @ApiProperty({ example: '+5511999999999' })
  phone?: string;

  @ApiProperty({ example: 'joao@example.com' })
  pix_key?: string;

  @ApiProperty({ example: 'https://example.com/logo.png' })
  logo_url?: string;

  @ApiProperty({
    example: { primary_color: '#000000', secondary_color: '#FFFFFF' },
  })
  theme?: Record<string, any>;

  @ApiProperty({
    example: { working_hours: { monday: [8, 18] } },
  })
  settings?: Record<string, any>;

  @ApiProperty({ example: 'FREE', enum: ['FREE', 'STARTER', 'PROFESSIONAL'] })
  subscription_tier: string;

  @ApiProperty({ example: true })
  subscription_active: boolean;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  owner_id: string;

  @ApiProperty({ example: '2026-02-27T12:00:00Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-02-27T12:00:00Z' })
  updated_at: Date;
}
