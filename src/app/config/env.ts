type EnvType = {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  cookieSecret: string;
  jwtAccessSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresDays: number;
};

export const getEnv = (): EnvType => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '5000', 10);
  const jwtAccessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  const jwtRefreshExpiresDays = parseInt(
    process.env.JWT_REFRESH_EXPIRES_DAYS || '30',
    10,
  );
  const mongoUri = process.env.MONGO_URI;
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
  const cookieSecret = process.env.COOKIE_SECRET;

  if (!mongoUri) throw new Error('MONGO_URI is not defined in environment variables');
  if (!jwtAccessSecret)
    throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
  if (!cookieSecret)
    throw new Error('COOKIE_SECRET is not defined in environment variables');

  return {
    port,
    nodeEnv,
    mongoUri,
    cookieSecret,
    jwtAccessSecret,
    jwtAccessExpiresIn,
    jwtRefreshExpiresDays,
  };
};
