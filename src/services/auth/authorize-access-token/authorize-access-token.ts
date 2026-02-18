import jwt from "jsonwebtoken";
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
      const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!);
      const userId = (payload as { userId: string }).userId;
      (req as any).userId = userId;
    } catch {
      throw new UnauthorizedInvalidTokenError();
    }
  }
}
