// ---------------------------------------------------------
// Auth service – business logic for authentication
// ---------------------------------------------------------

import { userRepository, roleRepository } from '../repositories';
import { AppError, generateTokenPair, verifyRefreshToken } from '../utils';
import { Messages, SystemRoles } from '../constants';
import type { CreateUserDto, LoginDto, AuthResponse, SanitizedUser, TokenPair } from '../types';
import type { IUserDocument, IRoleDocument } from '../models';

class AuthService {
  /**
   * Register a new user and return tokens.
   */
  async register(dto: CreateUserDto): Promise<AuthResponse> {
    const emailTaken = await userRepository.isEmailTaken(dto.email);
    if (emailTaken) {
      throw AppError.conflict(Messages.EMAIL_ALREADY_EXISTS);
    }

    // Default to Employee role if no roleId provided
    if (!dto.roleId) {
      const defaultRole = await roleRepository.findByName(SystemRoles.EMPLOYEE);
      if (!defaultRole) throw AppError.internal('Default role missing from database');
      dto.roleId = defaultRole._id.toString();
    }

    const userEntry = await userRepository.create(dto);
    const user = await userEntry.populate<{ roleId: IRoleDocument }>('roleId');
    
    const tokens = generateTokenPair(this.buildJwtPayload(user));

    return { user: this.sanitize(user), tokens };
  }

  /**
   * Authenticate a user by email + password and return tokens.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const userOrNull = await userRepository.findByEmail(dto.email, true);
    if (!userOrNull) {
      throw AppError.unauthorized(Messages.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await userOrNull.comparePassword(dto.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized(Messages.INVALID_CREDENTIALS);
    }

    const user = await userOrNull.populate<{ roleId: IRoleDocument }>('roleId');
    const tokens = generateTokenPair(this.buildJwtPayload(user));
    return { user: this.sanitize(user), tokens };
  }

  /**
   * Issue a new token pair from a valid refresh token.
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const payload = verifyRefreshToken(refreshToken);
    const userOrNull = await userRepository.findById(payload.userId);
    if (!userOrNull) {
      throw AppError.unauthorized(Messages.INVALID_TOKEN);
    }
    const user = await userOrNull.populate<{ roleId: IRoleDocument }>('roleId');

    return generateTokenPair(this.buildJwtPayload(user));
  }

  /**
   * Get the current user profile (for hydration).
   */
  async getMe(userId: string): Promise<SanitizedUser> {
    const userOrNull = await userRepository.findById(userId);
    if (!userOrNull) {
      throw AppError.unauthorized(Messages.INVALID_TOKEN);
    }
    const user = await userOrNull.populate<{ roleId: IRoleDocument }>('roleId');
    return this.sanitize(user);
  }

  // ── Helpers ────────────────────────────────────────────

  private buildJwtPayload(user: Omit<IUserDocument, 'roleId'> & { roleId: IRoleDocument }) {
    if (!user.roleId || typeof user.roleId === 'string' || !('_id' in user.roleId)) {
      throw AppError.forbidden('User account has an invalid or missing role configuration. Please contact an administrator.');
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      roleId: user.roleId._id.toString(),
    };
  }

  private sanitize(user: Omit<IUserDocument, 'roleId'> & { roleId: IRoleDocument }): SanitizedUser {
    if (!user.roleId || typeof user.roleId === 'string' || !('name' in user.roleId)) {
      throw AppError.forbidden('User account has an invalid or missing role configuration. Please contact an administrator.');
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: {
        id: user.roleId._id.toString(),
        name: user.roleId.name,
        permissions: user.roleId.permissions,
        description: user.roleId.description,
        isSystem: user.roleId.isSystem,
        createdAt: user.roleId.createdAt,
        updatedAt: user.roleId.updatedAt,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
