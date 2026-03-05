import { deleteUser } from "@users/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";


export const deleteUserHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const authenticatedId = (req as AuthenticatedRequest).userId;
  const result = await deleteUser(req.params.id, authenticatedId)
  return res.code(200).send(result);
}
