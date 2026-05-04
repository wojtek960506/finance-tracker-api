import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@auth/services', () => ({
  createEmailVerificationToken: vi.fn(),
  sendEmailVerification: vi.fn(),
}));

import { createEmailVerificationToken, sendEmailVerification } from '@auth/services';
import { UserModel } from '@user/model';

import { resendVerification } from './resend-verification';

describe('resendVerification', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('returns when user does not exist', async () => {
    vi.spyOn(UserModel, 'findOne').mockResolvedValue(null as any);

    await expect(
      resendVerification({ email: 'john@example.com' }),
    ).resolves.toBeUndefined();

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
    expect(createEmailVerificationToken).not.toHaveBeenCalled();
    expect(sendEmailVerification).not.toHaveBeenCalled();
  });

  it('returns when user is already self verified', async () => {
    const save = vi.fn();
    vi.spyOn(UserModel, 'findOne').mockResolvedValue({
      email: 'john@example.com',
      emailVerificationMethod: 'self-verified',
      save,
    } as any);

    await expect(
      resendVerification({ email: 'john@example.com' }),
    ).resolves.toBeUndefined();

    expect(createEmailVerificationToken).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    expect(sendEmailVerification).not.toHaveBeenCalled();
  });

  it('generates and sends a fresh verification token for unverified users', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const user = {
      email: 'john@example.com',
      emailVerifiedAt: null,
      emailVerificationMethod: null,
      save,
    } as any;

    vi.spyOn(UserModel, 'findOne').mockResolvedValue(user);
    (createEmailVerificationToken as any).mockReturnValue({
      token: 'verification-token',
      tokenHash: 'verification-token-hash',
      expiresAt: new Date('2026-05-07T10:00:00.000Z'),
    });
    (sendEmailVerification as any).mockResolvedValue(undefined);

    await resendVerification({ email: 'john@example.com' });

    expect(createEmailVerificationToken).toHaveBeenCalledOnce();
    expect(user.emailVerificationTokenHash).toBe('verification-token-hash');
    expect(user.emailVerificationExpiresAt).toEqual(new Date('2026-05-07T10:00:00.000Z'));
    expect(save).toHaveBeenCalledOnce();
    expect(sendEmailVerification).toHaveBeenCalledWith({
      email: 'john@example.com',
      token: 'verification-token',
    });
  });

  it('generates and sends a fresh verification token for legacy-backfill users', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const user = {
      email: 'john@example.com',
      emailVerifiedAt: new Date('2026-05-05T10:00:00.000Z'),
      emailVerificationMethod: 'legacy-backfill',
      save,
    } as any;

    vi.spyOn(UserModel, 'findOne').mockResolvedValue(user);
    (createEmailVerificationToken as any).mockReturnValue({
      token: 'verification-token',
      tokenHash: 'verification-token-hash',
      expiresAt: new Date('2026-05-07T10:00:00.000Z'),
    });
    (sendEmailVerification as any).mockResolvedValue(undefined);

    await resendVerification({ email: 'john@example.com' });

    expect(createEmailVerificationToken).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledOnce();
    expect(sendEmailVerification).toHaveBeenCalledWith({
      email: 'john@example.com',
      token: 'verification-token',
    });
  });
});
