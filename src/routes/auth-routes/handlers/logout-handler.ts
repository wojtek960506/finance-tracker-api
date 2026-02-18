import { logout } from "@services/auth";
import { FastifyReply, FastifyRequest } from "fastify";
import { getRefreshCookieOptions } from "./refresh-cookie-options";


export const logoutHandler = async (req: FastifyRequest, res: FastifyReply) => {

  // first clear refresh token
  // There is no refresh mechanism for logout. In case of present access token we remove
  // hash of refresh token for the given user from DB.
  res.clearCookie("refreshToken", { ...getRefreshCookieOptions(), maxAge: 0 });

  // There is not error thrown from this function. In the worst case the refresh token
  // hash is not cleared from DB, but as the cookie is cleared on the client side,
  // the user won't be able to use it to get new access token. And during the next login,
  // the refresh token hash will be overridden in DB.
  await logout(req.headers.authorization);

  return res.code(204).send();
}
