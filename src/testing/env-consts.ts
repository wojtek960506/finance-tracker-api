export const PORT_TEST = 7777;
export const NODE_ENV_TEST = 'test';
export const APP_ORIGIN_TEST = 'http://localhost:3000';
export const JWT_REFRESH_EXPIRES_DAYS_TEST = 15;
export const EMAIL_VERIFICATION_EXPIRES_HOURS_TEST = 24;
export const RESEND_FROM_NAME_TEST = 'Finance Tracker Test';
export const COOKIE_SECRET_TEST = 'cookie-secret';
export const JWT_ACCESS_SECRET_TEST = 'jwt-secret';
export const MONGO_URI_TEST = 'mongodb://localhost:12345/test';
export const CORS_ORIGINS_TEST = ['http://localhost:3000', 'http://localhost:5173'];
export const CORS_ORIGIN_PATTERNS_TEST = [
  /^https:\/\/example-frontend(?:-[a-z0-9-]+)?\.vercel\.app$/
];

export const ENV_TEST_VALUES = {
  port: PORT_TEST,
  nodeEnv: NODE_ENV_TEST,
  appOrigin: APP_ORIGIN_TEST,
  mongoUri: MONGO_URI_TEST,
  corsOrigins: CORS_ORIGINS_TEST,
  corsOriginPatterns: CORS_ORIGIN_PATTERNS_TEST,
  cookieSecret: COOKIE_SECRET_TEST,
  jwtAccessSecret: JWT_ACCESS_SECRET_TEST,
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresDays: JWT_REFRESH_EXPIRES_DAYS_TEST,
  emailVerificationExpiresHours: EMAIL_VERIFICATION_EXPIRES_HOURS_TEST,
  resendFromName: RESEND_FROM_NAME_TEST,
};
