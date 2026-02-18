type EnvType = {
  port: number,
  nodeEnv: string,
  mongoUri: string,
  databaseUser: string,
  cookieSecret: string,
  jwtAccessSecret: string,
  databasePassword: string,
  jwtAccessExpiresIn: string,
  jwtRefreshExpiresDays: number,
}

export const getEnv = (): EnvType => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const port = parseInt(process.env.PORT || "5000", 10);
  const jwtAccessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
  const jwtRefreshExpiresDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "30", 10);
  const mongoUri = process.env.MONGO_URI;
  const databaseUser = process.env.DATABASE_USER;
  const databasePassword = process.env.DATABASE_PASSWORD;
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
  const cookieSecret = process.env.COOKIE_SECRET;

  if (!mongoUri) throw new Error("MONGO_URI is not defined in environment variables");
  if (!databaseUser) throw new Error("DATABASE_USER is not defined in environment variables");
  if (!databasePassword)
    throw new Error("DATABASE_PASSWORD is not defined in environment variables");
  if (!jwtAccessSecret)
    throw new Error("JWT_ACCESS_SECRET is not defined in environment variables");
  if (!cookieSecret) throw new Error("COOKIE_SECRET is not defined in environment variables");

  return {
    port,
    nodeEnv,
    mongoUri,
    databaseUser,
    cookieSecret,
    jwtAccessSecret,
    databasePassword,
    jwtAccessExpiresIn,
    jwtRefreshExpiresDays,
  }
}
