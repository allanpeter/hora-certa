import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min, MinLength } from 'class-validator';
import { ServiceCategory } from '../../common/enums';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration_minutes?: number;

  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @IsOptional()
  @IsString()
  icon_url?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
