import { IsUUID, IsString, IsOptional, IsNumber, Min, Max, IsObject } from 'class-validator';

export class CreateBarberDto {
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_percentage?: number;

  @IsOptional()
  @IsObject()
  working_hours?: Record<string, any>;
}
