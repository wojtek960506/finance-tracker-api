import { randomBytes } from 'crypto';

import { getEnv } from '@app/config';

import { getTokenHash } from '../auth-tokens';

export const createEmailVerificationToken = () => {
  const token = randomBytes(32).toString('hex');
  const tokenHash = getTokenHash(token);
  const { emailVerificationExpiresHours } = getEnv();
  const expiresAt = new Date(Date.now() + emailVerificationExpiresHours * 60 * 60 * 1000);

  return { token, tokenHash, expiresAt };
};
