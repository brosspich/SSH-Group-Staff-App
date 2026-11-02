import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

export class JwtSigner {
  static sign(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }
}
