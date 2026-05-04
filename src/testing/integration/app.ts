import { FastifyInstance } from 'fastify';

import { buildApp } from '@app/app';

import {
  clearIntegrationMongo,
  connectIntegrationMongo,
  getIntegrationMongoUri,
  setIntegrationTestEnv,
} from './mongo';

export const INTEGRATION_TEST_ENV = {
  port: 5000,
  nodeEnv: 'test',
  appOrigin: 'http://localhost:3000',
  mongoUri: getIntegrationMongoUri(),
  corsOrigins: ['http://localhost:3000'],
  corsOriginPatterns: [],
  cookieSecret: 'integration-test-cookie-secret',
  jwtAccessSecret: 'integration-test-jwt-secret',
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresDays: 30,
  emailVerificationExpiresHours: 24,
  resendFromName: 'Finance Tracker',
};

export const createIntegrationApp = async (): Promise<FastifyInstance> => {
  setIntegrationTestEnv();
  await connectIntegrationMongo();
  await clearIntegrationMongo();

  const app = await buildApp(INTEGRATION_TEST_ENV);
  await app.ready();

  return app;
};
