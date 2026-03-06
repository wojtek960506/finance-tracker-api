import { getUsers } from "@user/services"
import { FastifyReply, FastifyRequest } from "fastify"


export const getUsersHandler = async (
  _req: FastifyRequest,
  res: FastifyReply,
) => {
  const result = await getUsers();
  return res.code(200).send(result);
}
