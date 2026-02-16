import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Profile } from 'passport-google-oauth20';

import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify-otp.dto';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already exists');

    const hash = await bcrypt.hash(dto.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = this.userRepo.create({
      email: dto.email,
      password: hash,
      isEmailVerified: false,
      emailOtp: otp,
      emailOtpExpires: new Date(Date.now() + 1000 * 60 * 10),

      // moved into user table now
      fullName: dto.fullName,
    });

    await this.userRepo.save(user);

    await this.mailService.sendOtpEmail(dto.email, otp);

    return {
      message: 'OTP sent to email. Verify to activate account.',
    };
  }

  async verifyEmailOtp(dto: VerifyDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'emailOtp', 'emailOtpExpires'],
    });

    if (!user) throw new BadRequestException('Invalid OTP');

    if (
      user.emailOtp !== dto.otp ||
      !user.emailOtpExpires ||
      user.emailOtpExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.userRepo.update(user.id, {
      isEmailVerified: true,
      emailOtp: undefined,
      emailOtpExpires: undefined,
    });

    return { success: true };
  }

  async resendOtp(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return { success: true };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.userRepo.update(user.id, {
      emailOtp: otp,
      emailOtpExpires: new Date(Date.now() + 1000 * 60 * 10),
    });

    await this.mailService.sendOtpEmail(email, otp);
    return { success: true };
  }

  async login(dto: LoginDto, userAgent: string, ip: string) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'password', 'isEmailVerified'],
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.isEmailVerified)
      throw new UnauthorizedException('Email not verified');

    const match = await bcrypt.compare(dto.password, user.password!);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return this.createSession(user, userAgent, ip);
  }

  async googleLogin(profile: Profile, userAgent: string, ip: string) {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new BadRequestException('No email from Google');

    const googleAvatar = profile.photos?.[0]?.value || null;
    const googleFullName = profile.displayName || null;

    let user = await this.userRepo.findOne({ where: { email } });

    // ============================
    // NEW USER
    // ============================
    if (!user) {
      user = this.userRepo.create({
        email,
        googleId: profile.id,
        provider: 'google',
        isEmailVerified: true,

        // moved into users table now
        fullName: googleFullName || undefined,
        avatar: googleAvatar || undefined,
      });

      await this.userRepo.save(user);
      return this.createSession(user, userAgent, ip);
    }

    // ============================
    // EXISTING USER
    // ============================
    if (!user.googleId) user.googleId = profile.id;
    user.provider = 'google';
    user.isEmailVerified = true;

    // only fill if empty (don’t overwrite user-edited profile)
    if (!user.fullName && googleFullName) user.fullName = googleFullName;
    if (!user.avatar && googleAvatar) user.avatar = googleAvatar;

    await this.userRepo.save(user);

    return this.createSession(user, userAgent, ip);
  }

  async refresh(refreshToken: string, userAgent: string, ip: string) {
    const stored = await this.refreshRepo.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!stored || stored.expiresAt < new Date())
      throw new UnauthorizedException('Invalid refresh token');

    await this.refreshRepo.delete({ id: stored.id });

    return this.createSession(stored.user, userAgent, ip);
  }

  async logout(refreshToken: string) {
    await this.refreshRepo.delete({ token: refreshToken });
    return { success: true };
  }

  async logoutAll(userId: string) {
    await this.refreshRepo.delete({ user: { id: userId } });
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return { success: true };

    const token = randomUUID();

    await this.userRepo.update(user.id, {
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + 1000 * 60 * 60),
    });

    await this.mailService.sendResetPasswordEmail(email, token);
    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepo.findOne({
      where: { passwordResetToken: token },
      select: ['id', 'passwordResetExpires'],
    });

    if (!user || user.passwordResetExpires! < new Date())
      throw new BadRequestException('Invalid or expired token');

    const hash = await bcrypt.hash(newPassword, 10);

    await this.userRepo.update(user.id, {
      password: hash,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { success: true };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepo.findOne({
      where: { emailVerificationToken: token },
      select: ['id', 'emailVerificationExpires'],
    });

    if (!user || user.emailVerificationExpires! < new Date())
      throw new BadRequestException('Invalid or expired token');

    await this.userRepo.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    return { success: true };
  }

  private async createSession(user: User, userAgent: string, ip: string) {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = randomUUID();

    await this.refreshRepo.save({
      token: refreshToken,
      user,
      userAgent,
      ipAddress: ip,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
