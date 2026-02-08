import { IsEmail, IsNotEmpty, Min } from 'class-validator';

export class VerifyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Min(6)
  otp: string;
}
