import { z } from 'zod/v4';

const requiredEnvString = (message: string) =>
  z.preprocess((value) => (value == null ? '' : value), z.string().min(1, message));

const splitCsv = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const parseRegexPatterns = (value: string) =>
  splitCsv(value).map((pattern) => {
    try {
      return new RegExp(pattern);
    } catch {
      throw new Error(`Invalid CORS_ORIGIN_PATTERNS regex: ${pattern}`);
    }
  });

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().default(5000),
  APP_ORIGIN: z.url().default('http://localhost:3000'),
  MONGO_URI: requiredEnvString('MONGO_URI is not defined in environment variables'),
  CORS_ORIGINS: z
    .preprocess(
      (value) => (value == null ? '' : value),
      z.string().min(1, 'CORS_ORIGINS is not defined in environment variables'),
    )
    .transform(splitCsv)
    .refine((value) => value.length > 0, {
      message: 'CORS_ORIGINS is not defined in environment variables',
    }),
  CORS_ORIGIN_PATTERNS: z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (!value?.trim()) return [];

      try {
        return parseRegexPatterns(value);
      } catch (error) {
        ctx.addIssue({
          code: 'custom',
          message: error instanceof Error ? error.message : 'Invalid CORS_ORIGIN_PATTERNS',
        });

        return z.NEVER;
      }
    }),
  JWT_ACCESS_SECRET: requiredEnvString(
    'JWT_ACCESS_SECRET is not defined in environment variables',
  ),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().int().default(30),
  EMAIL_VERIFICATION_EXPIRES_HOURS: z.coerce.number().int().positive().default(24),
  COOKIE_SECRET: requiredEnvString('COOKIE_SECRET is not defined in environment variables'),
});

export type EnvType = {
  appOrigin: string;
  port: number;
  nodeEnv: string;
  mongoUri: string;
  corsOrigins: string[];
  corsOriginPatterns: RegExp[];
  cookieSecret: string;
  jwtAccessSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresDays: number;
  emailVerificationExpiresHours: number;
};

export const getEnv = (): EnvType => {
  const parsed = envSchema.parse(process.env);

  return {
    appOrigin: parsed.APP_ORIGIN,
    port: parsed.PORT,
    nodeEnv: parsed.NODE_ENV,
    mongoUri: parsed.MONGO_URI,
    corsOrigins: parsed.CORS_ORIGINS,
    corsOriginPatterns: parsed.CORS_ORIGIN_PATTERNS,
    cookieSecret: parsed.COOKIE_SECRET,
    jwtAccessSecret: parsed.JWT_ACCESS_SECRET,
    jwtAccessExpiresIn: parsed.JWT_ACCESS_EXPIRES_IN,
    jwtRefreshExpiresDays: parsed.JWT_REFRESH_EXPIRES_DAYS,
    emailVerificationExpiresHours: parsed.EMAIL_VERIFICATION_EXPIRES_HOURS,
  };
};
