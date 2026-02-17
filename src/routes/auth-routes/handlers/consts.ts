const isProductionEnv = process.env.NODE_ENV === "production";
const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "30", 10);

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProductionEnv,
  sameSite: isProductionEnv ? "none" : "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * refreshExpiresDays,
} as const;