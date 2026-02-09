import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { deleteTransactions } from "@services/transactions";


export const deleteTransactionsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const result = await deleteTransactions(ownerId);
  return res.code(200).send(result);
}
