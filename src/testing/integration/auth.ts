import jwt from 'jsonwebtoken';

import { setIntegrationTestEnv } from './mongo';

export const createIntegrationAccessToken = (userId: string) => {
  setIntegrationTestEnv();
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!);
};
