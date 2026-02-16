import { deleteUser } from "@services/users";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";
import { FastifyReply, FastifyRequest } from "fastify";


export const deleteUserHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const authenticatedId = (req as AuthenticatedRequest).userId;
  const result = await deleteUser(req.params.id, authenticatedId)
  return res.code(200).send(result);
}
