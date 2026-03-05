import { getEnv } from "@/config";


export const getRefreshCookieOptions = () => {
  const { nodeEnv, jwtRefreshExpiresDays } = getEnv();
  const isProductionEnv = nodeEnv === "production";
  
  return {
    httpOnly: true,
    secure: isProductionEnv,
    sameSite: isProductionEnv ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * jwtRefreshExpiresDays,
  } as const;
}
