import { VerifyEmailDTO } from '@auth/schema';
import { UserModel } from '@user/model';
import {
  ExpiredEmailVerificationTokenError,
  InvalidEmailVerificationTokenError,
} from '@utils/errors';

import { getTokenHash } from '../auth-tokens';

export const verifyEmail = async ({ token }: VerifyEmailDTO): Promise<void> => {
  const tokenHash = getTokenHash(token);
  const user = await UserModel.findOne({ emailVerificationTokenHash: tokenHash });

  if (!user || !user.emailVerificationExpiresAt) {
    throw new InvalidEmailVerificationTokenError();
  }

  if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
    throw new ExpiredEmailVerificationTokenError();
  }

  user.emailVerifiedAt = new Date();
  user.emailVerificationMethod = 'self-verified';
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpiresAt = null;

  await user.save();
};
