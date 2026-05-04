import argon2 from 'argon2';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAccessToken, createRefreshToken } from '@auth/services';
import { UserModel } from '@user/model';
import {
  UnauthorizedEmailNotVerifiedError,
  UnauthorizedInvalidCredentialsError,
  UnauthorizedUserNotFoundError,
} from '@utils/errors';

import { login } from './login';

vi.mock('argon2', () => ({ default: { verify: vi.fn() } }));
vi.mock('@auth/services', () => ({
  createAccessToken: vi.fn(),
  createRefreshToken: vi.fn(),
}));

describe('login', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('throws when user with given email does not exist', async () => {
    vi.spyOn(UserModel, 'findOne').mockResolvedValue(null as any);

    await expect(
      login({ email: 'john@example.com', password: 'secret-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedUserNotFoundError);
    expect(UserModel.findOne).toHaveBeenCalledOnce();
    expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
    expect(argon2.verify).not.toHaveBeenCalled();
  });

  it('throws when password is invalid', async () => {
    const user = {
      _id: { toString: () => 'user-123' },
      email: 'john@example.com',
      passwordHash: 'stored-password-hash',
      emailVerifiedAt: null,
      save: vi.fn(),
    } as any;

    vi.spyOn(UserModel, 'findOne').mockResolvedValue(user);
    (argon2.verify as any).mockResolvedValue(false);

    await expect(
      login({ email: 'john@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedInvalidCredentialsError);
    expect(argon2.verify).toHaveBeenCalledOnce();
    expect(argon2.verify).toHaveBeenCalledWith('stored-password-hash', 'wrong-password');
    expect(user.save).not.toHaveBeenCalled();
  });

  it('throws when email is not verified', async () => {
    const user = {
      _id: { toString: () => 'user-123' },
      email: 'john@example.com',
      passwordHash: 'stored-password-hash',
      emailVerifiedAt: null,
      save: vi.fn(),
    } as any;

    vi.spyOn(UserModel, 'findOne').mockResolvedValue(user);
    (argon2.verify as any).mockResolvedValue(true);

    await expect(
      login({ email: 'john@example.com', password: 'correct-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedEmailNotVerifiedError);
    expect(user.save).not.toHaveBeenCalled();
  });

  it('returns access and refresh token and stores refresh token hash', async () => {
    const userSaveMock = vi.fn().mockResolvedValue(undefined);
    const user = {
      _id: { toString: () => 'user-123' },
      email: 'john@example.com',
      passwordHash: 'stored-password-hash',
      emailVerifiedAt: new Date('2026-05-05T10:00:00.000Z'),
      save: userSaveMock,
    } as any;

    vi.spyOn(UserModel, 'findOne').mockResolvedValue(user);
    (argon2.verify as any).mockResolvedValue(true);
    (createAccessToken as any).mockReturnValue('access-token');
    (createRefreshToken as any).mockReturnValue({
      token: 'refresh-token',
      tokenHash: 'refresh-token-hash',
    });

    const result = await login({
      email: 'john@example.com',
      password: 'correct-password',
    });

    expect(createAccessToken).toHaveBeenCalledOnce();
    expect(createAccessToken).toHaveBeenCalledWith({
      userId: 'user-123',
      email: 'john@example.com',
    });
    expect(createRefreshToken).toHaveBeenCalledOnce();
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(user.refreshTokenHash.tokenHash).toBe('refresh-token-hash');
    expect(user.refreshTokenHash.createdAt).toBeInstanceOf(Date);
    expect(userSaveMock).toHaveBeenCalledOnce();
  });
});
