const isProductionEnv = process.env.NODE_ENV === "production";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProductionEnv,
  sameSite: isProductionEnv ? "none" : "lax",
  path: "/",
} as const;