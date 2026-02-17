import { getUser } from "@services/users";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";


export const getMeHandler = async (req: FastifyRequest, res: FastifyReply) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getUser(userId, userId);
  return res.code(200).send(result);
}
