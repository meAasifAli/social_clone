import { Request } from 'express';

export interface JwtUser {
  sub: string;
  email: string;
}

export type JwtRequest = Request & {
  user: JwtUser;
};
