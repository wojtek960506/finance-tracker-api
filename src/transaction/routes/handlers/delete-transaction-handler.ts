import { FastifyReply, FastifyRequest } from "fastify"
import { deleteTransaction } from "@transaction/services"
import { ParamsJustId, AuthenticatedRequest } from "@shared/http"


export async function deleteTransactionHandler(
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) {
  const transactionId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await deleteTransaction(transactionId, userId);
  return res.code(200).send(result);
}