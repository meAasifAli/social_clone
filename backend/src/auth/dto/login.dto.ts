import { IsEmail, IsNotEmpty, Min } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Min(8, { message: 'Password should be min 8 chars' })
  password: string;
}
