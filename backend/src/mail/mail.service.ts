import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: `"Social App" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    return this.sendEmail(
      email,
      'Verify your account',
      `<p>Click to verify your account:</p><a href="${link}">${link}</a>`,
    );
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    return this.sendEmail(
      email,
      'Reset your password',
      `<p>Reset your password:</p><a href="${link}">${link}</a>`,
    );
  }

  async sendOtpEmail(email: string, otp: string) {
    await this.transporter.sendMail({
      to: email,
      subject: 'Verify your account',
      html: `
      <h2>Your verification code</h2>
      <h1>${otp}</h1>
      <p>Expires in 10 minutes</p>
    `,
    });
  }
}
