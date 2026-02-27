import { IsString, IsNumber, IsOptional, Min, Max, IsArray } from 'class-validator';

export class DayWorkingHoursDto {
  @IsNumber()
  @Min(0)
  @Max(23)
  start_hour: number; // 0-23

  @IsNumber()
  @Min(0)
  @Max(59)
  start_minute: number; // 0-59

  @IsNumber()
  @Min(0)
  @Max(23)
  end_hour: number; // 0-23

  @IsNumber()
  @Min(0)
  @Max(59)
  end_minute: number; // 0-59

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  lunch_start_hour?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(59)
  lunch_start_minute?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  lunch_end_hour?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(59)
  lunch_end_minute?: number;
}

export class UpdateWorkingHoursDto {
  @IsOptional()
  @IsArray()
  monday?: DayWorkingHoursDto;

  @IsOptional()
  @IsArray()
  tuesday?: DayWorkingHoursDto;

  @IsOptional()
  @IsArray()
  wednesday?: DayWorkingHoursDto;

  @IsOptional()
  @IsArray()
  thursday?: DayWorkingHoursDto;

  @IsOptional()
  @IsArray()
  friday?: DayWorkingHoursDto;

  @IsOptional()
  @IsArray()
  saturday?: DayWorkingHoursDto;

  @IsOptional()
  @IsArray()
  sunday?: DayWorkingHoursDto;
}

export class AvailableSlotDto {
  @IsString()
  slot_start: string; // ISO 8601 datetime

  @IsString()
  slot_end: string; // ISO 8601 datetime

  @IsString()
  barber_id: string;
}

export class AvailableSlotsRequestDto {
  @IsString()
  date: string; // YYYY-MM-DD

  @IsString()
  barber_id: string;

  @IsNumber()
  service_duration_minutes: number;
}
