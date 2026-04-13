// ---------------------------------------------------------
// JWT utilities – sign, verify, decode
// ---------------------------------------------------------

import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import type { JwtPayload, TokenPair } from '../types';

/**
 * Issue an access + refresh token pair for a given user payload.
 */
export function generateTokenPair(payload: JwtPayload): TokenPair {
  const accessToken = jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as string & { __brand: 'StringValue' },
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn as string & { __brand: 'StringValue' },
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

/**
 * Verify an access token and return its decoded payload.
 * Throws on expiry or tampering – let the caller handle the error.
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.secret) as JwtPayload;
}

/**
 * Verify a refresh token and return its decoded payload.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
}
