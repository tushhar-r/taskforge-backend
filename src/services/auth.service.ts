// ---------------------------------------------------------
// Auth service – business logic for authentication
// ---------------------------------------------------------

import { userRepository } from '../repositories';
import { AppError, generateTokenPair, verifyRefreshToken } from '../utils';
import { Messages } from '../constants';
import type { CreateUserDto, LoginDto, AuthResponse, SanitizedUser, TokenPair } from '../types';
import type { IUserDocument } from '../models';

class AuthService {
  /**
   * Register a new user and return tokens.
   */
  async register(dto: CreateUserDto): Promise<AuthResponse> {
    const emailTaken = await userRepository.isEmailTaken(dto.email);
    if (emailTaken) {
      throw AppError.conflict(Messages.EMAIL_ALREADY_EXISTS);
    }

    const user = await userRepository.create(dto);
    const tokens = generateTokenPair(this.buildJwtPayload(user));

    return { user: this.sanitize(user), tokens };
  }

  /**
   * Authenticate a user by email + password and return tokens.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(dto.email, true);
    if (!user) {
      throw AppError.unauthorized(Messages.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await user.comparePassword(dto.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized(Messages.INVALID_CREDENTIALS);
    }

    const tokens = generateTokenPair(this.buildJwtPayload(user));
    return { user: this.sanitize(user), tokens };
  }

  /**
   * Issue a new token pair from a valid refresh token.
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const payload = verifyRefreshToken(refreshToken);
    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw AppError.unauthorized(Messages.INVALID_TOKEN);
    }

    return generateTokenPair(this.buildJwtPayload(user));
  }

  // ── Helpers ────────────────────────────────────────────

  private buildJwtPayload(user: IUserDocument) {
    return {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }

  private sanitize(user: IUserDocument): SanitizedUser {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
