import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  HttpCode,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Profile } from 'passport-google-oauth20';
import { VerifyDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: RegisterDto,
  ) {
    return this.authService.register(body);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyDto) {
    return this.authService.verifyEmailOtp(dto);
  }

  @Post('resend-otp')
  async resend(@Body('email') email: string) {
    return this.authService.resendOtp(email);
  }

  @Post('forgot-password')
  async forgot(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async reset(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body()
    body: LoginDto,
    @Req() req: Request,
  ) {
    return this.authService.login(
      body,
      req.headers['user-agent'] || 'unknown',
      req.ip || '0.0.0.0',
    );
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request & { user: Profile },
    @Res() res: Response,
  ) {
    const data = await this.authService.googleLogin(
      req.user,
      req.headers['user-agent'] || 'unknown',
      req.ip || '0.0.0.0',
    );

    const redirectUrl =
      `http://localhost:5173/auth/google-success` +
      `?accessToken=${data.accessToken}` +
      `&user=${encodeURIComponent(JSON.stringify(data.user))}`;

    return res.redirect(redirectUrl);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }, @Req() req: Request) {
    return this.authService.refresh(
      body.refreshToken,
      req.headers['user-agent'] || 'unknown',
      req.ip || '0.0.0.0',
    );
  }

  @Post('logout')
  async logout(@Body() body: { refreshToken: string }) {
    return this.authService.logout(body.refreshToken);
  }

  @Post('logout-all')
  @UseGuards(AuthGuard('jwt'))
  async logoutAll(@Req() req: any) {
    return this.authService.logoutAll(req.user.sub);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: any) {
    return await req.user;
  }
}
