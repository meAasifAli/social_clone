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
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify-otp.dto';

import { JwtRequest } from '../types/jwt-request.type';
import { GoogleRequest } from '../types/google-request.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
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
  async login(@Body() body: LoginDto, @Req() req: JwtRequest) {
    return this.authService.login(
      body,
      req.headers['user-agent'] || 'unknown',
      req.ip || '0.0.0.0',
    );
  }

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    const data = await this.authService.googleLogin(
      req.user,
      req.headers['user-agent'] || 'unknown',
      req.ip || '0.0.0.0',
    );

    // ✅ store refreshToken in HttpOnly cookie
    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: false, // true in production https
      sameSite: 'lax',
      path: '/api/v1/auth/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const redirectUrl =
      `http://localhost:5173/auth/google-success` +
      `?accessToken=${data.accessToken}` +
      `&user=${encodeURIComponent(JSON.stringify(data.user))}`;

    return res.redirect(redirectUrl);
  }

  @Post('refresh')
  async refresh(
    @Body() body: { refreshToken: string },
    @Req() req: JwtRequest,
  ) {
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
  async logoutAll(@Req() req: JwtRequest) {
    return this.authService.logoutAll(req.user.sub);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: JwtRequest) {
    return req.user;
  }
}
