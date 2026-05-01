import { FastifyInstance } from 'fastify';
import { afterAll, afterEach, beforeEach } from 'vitest';

import { createIntegrationApp } from './app';
import { clearIntegrationMongo, disconnectIntegrationMongo } from './mongo';

export const setupIntegrationSuite = () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createIntegrationApp();
  });

  afterEach(async () => {
    await app.close();
    await clearIntegrationMongo();
  });

  afterAll(async () => {
    await disconnectIntegrationMongo();
  });

  return {
    getApp: () => app,
  };
};
