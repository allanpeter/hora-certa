import { IsString, IsOptional, IsPhoneNumber, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    example: 'barber-shop-1',
    description: 'Unique slug for the barber shop URL (lowercase, hyphens)',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  slug: string;

  @ApiProperty({
    example: 'João Silva Barbearia',
    description: 'Name of the barber shop',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Rua das Flores, 123, São Paulo, SP',
    description: 'Shop address',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiProperty({
    example: '+5511999999999',
    description: 'Shop phone number (Brazilian format)',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('BR')
  phone?: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'PIX key for receiving payments (email, CPF, phone, or random key)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pix_key?: string;
}
