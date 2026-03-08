import { IsString, IsNumber, IsEnum, IsOptional, Min, MinLength, IsUUID } from 'class-validator';
import { ServiceCategory } from '../../common/enums';

export class CreateServiceDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration_minutes?: number;

  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @IsOptional()
  @IsString()
  icon_url?: string;

  @IsUUID()
  tenant_id: string;
}
