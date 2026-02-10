import { getUser } from "@services/users";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";


export const getUserHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id } = req.params;
  const result = await getUser(id, userId);
  return res.code(200).send(result);
}
