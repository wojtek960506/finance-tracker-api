import jwt from "jsonwebtoken";
import { AppError } from "@utils/errors";
import { FastifyReply, FastifyRequest } from "fastify";


export function authorizeAccessToken() {
  return async (req: FastifyRequest, _reply: FastifyReply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "Missing token");
    }

    const accessToken = authHeader.split(" ")[1];
    try {
      const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!);
      const userId = (payload as { userId: string }).userId;
      (req as any).userId = userId;
    } catch {
      throw new AppError(401, "Invalid or expired token");
    }
  }
}