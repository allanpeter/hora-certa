import { IsString, IsOptional, IsPhoneNumber, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTenantDto {
  @ApiProperty({
    example: 'João Silva Barbearia Atualizada',
    description: 'Name of the barber shop',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'Rua das Flores, 456, São Paulo, SP',
    description: 'Shop address',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiProperty({
    example: '+5511988888888',
    description: 'Shop phone number (Brazilian format)',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('BR')
  phone?: string;

  @ApiProperty({
    example: 'joao.silva@example.com',
    description: 'PIX key for receiving payments',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pix_key?: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Logo URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  logo_url?: string;

  @ApiProperty({
    example: { primary_color: '#000000' },
    description: 'Theme configuration',
    required: false,
  })
  @IsOptional()
  theme?: Record<string, any>;

  @ApiProperty({
    example: { working_hours: {} },
    description: 'Shop settings',
    required: false,
  })
  @IsOptional()
  settings?: Record<string, any>;
}
