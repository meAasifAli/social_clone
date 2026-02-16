// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: { sub: string; email: string }) {
    // This payload is what you signed in your auth service
    // Make sure it contains the user ID and email
    return {
      sub: payload.sub,
      email: payload.email,
      userId: payload.sub, // Add this for compatibility
    };
  }
}
