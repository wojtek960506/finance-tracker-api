import { afterEach, describe, expect, it } from 'vitest';
import { ZodError } from 'zod/v4';

import { getEnv } from './env';

describe('getEnv', () => {
  const originalEnv = { ...process.env };

  const setRequiredEnv = () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/finance-tracker-test';
    process.env.CORS_ORIGINS = 'http://localhost:3000,http://localhost:5173';
    process.env.JWT_ACCESS_SECRET = 'jwt-secret';
    process.env.COOKIE_SECRET = 'cookie-secret';
  };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns parsed env values', () => {
    setRequiredEnv();
    process.env.NODE_ENV = 'production';
    process.env.PORT = '8080';
    process.env.CORS_ORIGIN_PATTERNS =
      '^https://example-frontend(?:-[a-z0-9-]+)?\\.vercel\\.app$';
    process.env.JWT_ACCESS_EXPIRES_IN = '30m';
    process.env.JWT_REFRESH_EXPIRES_DAYS = '14';

    const env = getEnv();

    expect(env).toEqual({
      nodeEnv: 'production',
      port: 8080,
      mongoUri: 'mongodb://localhost:27017/finance-tracker-test',
      corsOrigins: ['http://localhost:3000', 'http://localhost:5173'],
      corsOriginPatterns: [
        /^https:\/\/example-frontend(?:-[a-z0-9-]+)?\.vercel\.app$/,
      ],
      jwtAccessSecret: 'jwt-secret',
      cookieSecret: 'cookie-secret',
      jwtAccessExpiresIn: '30m',
      jwtRefreshExpiresDays: 14,
    });
  });

  it('uses defaults for optional env values', () => {
    setRequiredEnv();
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.JWT_ACCESS_EXPIRES_IN;
    delete process.env.JWT_REFRESH_EXPIRES_DAYS;

    const env = getEnv();

    expect(env.nodeEnv).toBe('development');
    expect(env.port).toBe(5000);
    expect(env.corsOriginPatterns).toEqual([]);
    expect(env.jwtAccessExpiresIn).toBe('15m');
    expect(env.jwtRefreshExpiresDays).toBe(30);
  });

  it('throws when CORS_ORIGIN_PATTERNS contains invalid regex', () => {
    setRequiredEnv();
    process.env.CORS_ORIGIN_PATTERNS = '[invalid-regex';

    expect(() => getEnv()).toThrow(ZodError);
    expect(() => getEnv()).toThrow('Invalid CORS_ORIGIN_PATTERNS regex: [invalid-regex');
  });

  it.each([
    ['MONGO_URI', 'MONGO_URI is not defined in environment variables'],
    ['CORS_ORIGINS', 'CORS_ORIGINS is not defined in environment variables'],
    ['JWT_ACCESS_SECRET', 'JWT_ACCESS_SECRET is not defined in environment variables'],
    ['COOKIE_SECRET', 'COOKIE_SECRET is not defined in environment variables'],
  ])('throws when %s is missing', (key, message) => {
    setRequiredEnv();
    delete process.env[key as keyof NodeJS.ProcessEnv];

    expect(() => getEnv()).toThrow(ZodError);
    expect(() => getEnv()).toThrow(message);
  });
});
