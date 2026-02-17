import { login } from "@services/auth";
import { LoginDTO } from "@schemas/auth";
import { refreshCookieOptions } from "./consts";
import { FastifyReply, FastifyRequest } from "fastify";


export const loginHandler = async (
  req: FastifyRequest<{ Body: LoginDTO }>,
  res: FastifyReply,
) => {
  const { accessToken, refreshToken } = await login(req.body);

  // set refresh token cookie (HttpOnly, Secure)
  const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "30", 10);
  res.setCookie("refreshToken", refreshToken, {
    ...refreshCookieOptions,
    maxAge: 60 * 60 * 24 * refreshExpiresDays,
  })

  return res.code(200).send({ accessToken });
}
