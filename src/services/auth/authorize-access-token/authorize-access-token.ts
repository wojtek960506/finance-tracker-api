import jwt from "jsonwebtoken";
import { getEnv } from "@/config";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  UnauthorizedInvalidTokenError,
  UnauthorizedMissingTokenError,
} from "@utils/errors";


export function authorizeAccessToken() {
  return async (req: FastifyRequest, _reply: FastifyReply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) throw new UnauthorizedMissingTokenError();

    const accessToken = authHeader.split(" ")[1];
    try {
      const { jwtAccessSecret } = getEnv();
      const payload = jwt.verify(accessToken, jwtAccessSecret);
      const userId = (payload as { userId: string }).userId;
      (req as any).userId = userId;
    } catch {
      throw new UnauthorizedInvalidTokenError();
    }
  }
}
