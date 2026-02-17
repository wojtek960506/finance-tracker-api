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
  res.setCookie("refreshToken", refreshToken, { ...refreshCookieOptions });

  return res.code(200).send({ accessToken });
}
