import jwt from 'jsonwebtoken';

import { INTEGRATION_TEST_ENV } from './app';

export const createIntegrationAccessToken = (userId: string) =>
  jwt.sign({ userId }, INTEGRATION_TEST_ENV.jwtAccessSecret);
