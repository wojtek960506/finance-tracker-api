import { afterEach, describe, expect, it, vi } from 'vitest';

// mock BEFORE importing the file that uses argon2
vi.mock('argon2', () => ({ default: { hash: vi.fn() } }));
vi.mock('@auth/services', () => ({
  createEmailVerificationToken: vi.fn(),
  sendEmailVerification: vi.fn(),
}));

import argon2 from 'argon2';

import { createEmailVerificationToken, sendEmailVerification } from '@auth/services';
import {
  getUserDTO,
  getUserResultJSON,
  getUserResultSerialized,
  USER_PASSWORD_HASH,
} from '@testing/factories/user';
import { UserModel } from '@user/model';
import * as serializers from '@user/serializers';
import { AppError } from '@utils/errors';

import { createUser } from './create-user';

describe('createUser', () => {
  const user = getUserResultJSON();
  const userSerialized = getUserResultSerialized();
  const { password, ...restOfUserDTO } = getUserDTO();
  const sessionMock = {} as any;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates user', async () => {
    const tokenExpiresAt = new Date('2026-05-05T10:00:00.000Z');
    (argon2.hash as any).mockResolvedValue(USER_PASSWORD_HASH);
    (createEmailVerificationToken as any).mockReturnValue({
      token: 'verification-token',
      tokenHash: 'verification-token-hash',
      expiresAt: tokenExpiresAt,
    });
    (sendEmailVerification as any).mockResolvedValue(undefined);
    vi.spyOn(UserModel, 'create').mockResolvedValue([user] as any);
    vi.spyOn(serializers, 'serializeUser').mockReturnValue(userSerialized as any);

    const result = await createUser({ ...restOfUserDTO, password }, sessionMock);

    expect(argon2.hash).toHaveBeenCalledOnce();
    expect(argon2.hash).toHaveBeenCalledWith(password);
    expect(UserModel.create).toHaveBeenCalledOnce();
    expect(UserModel.create).toHaveBeenCalledWith(
      [
        {
          ...restOfUserDTO,
          passwordHash: USER_PASSWORD_HASH,
          emailVerifiedAt: null,
          emailVerificationMethod: null,
          emailVerificationTokenHash: 'verification-token-hash',
          emailVerificationExpiresAt: tokenExpiresAt,
        },
      ],
      { session: sessionMock },
    );
    expect(sendEmailVerification).toHaveBeenCalledOnce();
    expect(sendEmailVerification).toHaveBeenCalledWith({
      email: user.email,
      token: 'verification-token',
    });
    expect(serializers.serializeUser).toHaveBeenCalledOnce();
    expect(serializers.serializeUser).toHaveBeenCalledWith(user);
    expect(result).toEqual(userSerialized);
  });

  it('throws error when user with given email exists', async () => {
    const EMAIL_ALREADY_EXISTS_CODE = 11000;
    (createEmailVerificationToken as any).mockReturnValue({
      token: 'verification-token',
      tokenHash: 'verification-token-hash',
      expiresAt: new Date('2026-05-05T10:00:00.000Z'),
    });
    vi.spyOn(UserModel, 'create').mockRejectedValue({ code: EMAIL_ALREADY_EXISTS_CODE });
    vi.spyOn(serializers, 'serializeUser');

    await expect(createUser({ ...restOfUserDTO, password })).rejects.toThrow(Error);
    expect(UserModel.create).toHaveBeenCalledOnce();
    expect(sendEmailVerification).not.toHaveBeenCalled();
    expect(serializers.serializeUser).not.toHaveBeenCalled();
  });

  it('throws some not specific error', async () => {
    (createEmailVerificationToken as any).mockReturnValue({
      token: 'verification-token',
      tokenHash: 'verification-token-hash',
      expiresAt: new Date('2026-05-05T10:00:00.000Z'),
    });
    vi.spyOn(UserModel, 'create').mockResolvedValue({} as any);
    vi.spyOn(serializers, 'serializeUser').mockImplementation(() => {
      throw new Error();
    });

    await expect(createUser({ ...restOfUserDTO, password })).rejects.toThrow(AppError);
    expect(UserModel.create).toHaveBeenCalledOnce();
    expect(sendEmailVerification).not.toHaveBeenCalled();
    expect(serializers.serializeUser).not.toHaveBeenCalled();
  });
});
