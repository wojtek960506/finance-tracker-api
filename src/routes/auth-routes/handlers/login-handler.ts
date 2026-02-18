import { login } from "@services/auth";
import { LoginDTO } from "@schemas/auth";
import { FastifyReply, FastifyRequest } from "fastify";
import { getRefreshCookieOptions } from "./refresh-cookie-options";


export const loginHandler = async (
  req: FastifyRequest<{ Body: LoginDTO }>,
  res: FastifyReply,
) => {
  const { accessToken, refreshToken } = await login(req.body);

  // set refresh token cookie (HttpOnly, Secure)
  res.setCookie("refreshToken", refreshToken, { ...getRefreshCookieOptions() });

  return res.code(200).send({ accessToken });
}
