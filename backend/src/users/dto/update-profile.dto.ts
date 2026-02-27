import { IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(11)
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}
