import { z } from 'zod/v4';

const requiredEnvString = (message: string) =>
  z.preprocess((value) => (value == null ? '' : value), z.string().min(1, message));

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().default(5000),
  MONGO_URI: requiredEnvString('MONGO_URI is not defined in environment variables'),
  CORS_ORIGINS: z
    .preprocess(
      (value) => (value == null ? '' : value),
      z.string().min(1, 'CORS_ORIGINS is not defined in environment variables'),
    )
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    )
    .refine((value) => value.length > 0, {
      message: 'CORS_ORIGINS is not defined in environment variables',
    }),
  JWT_ACCESS_SECRET: requiredEnvString(
    'JWT_ACCESS_SECRET is not defined in environment variables',
  ),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().int().default(30),
  COOKIE_SECRET: requiredEnvString('COOKIE_SECRET is not defined in environment variables'),
});

export type EnvType = {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  corsOrigins: string[];
  cookieSecret: string;
  jwtAccessSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresDays: number;
};

export const getEnv = (): EnvType => {
  const parsed = envSchema.parse(process.env);

  return {
    port: parsed.PORT,
    nodeEnv: parsed.NODE_ENV,
    mongoUri: parsed.MONGO_URI,
    corsOrigins: parsed.CORS_ORIGINS,
    cookieSecret: parsed.COOKIE_SECRET,
    jwtAccessSecret: parsed.JWT_ACCESS_SECRET,
    jwtAccessExpiresIn: parsed.JWT_ACCESS_EXPIRES_IN,
    jwtRefreshExpiresDays: parsed.JWT_REFRESH_EXPIRES_DAYS,
  };
};
