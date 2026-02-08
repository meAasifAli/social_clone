import { IsEmail, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @Min(6, { message: 'Minimum should be 6 chars' })
  @IsOptional()
  fullName: string;
}
