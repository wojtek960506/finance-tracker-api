import { getUser } from "@user/services"
import { AuthenticatedRequest } from "@shared/http"
import { FastifyReply, FastifyRequest } from "fastify"


export const getMeHandler = async (req: FastifyRequest, res: FastifyReply) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getUser(userId, userId);
  return res.code(200).send(result);
}
