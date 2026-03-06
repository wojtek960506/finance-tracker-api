import { AuthenticatedRequest } from "@shared/http"
import { FastifyReply, FastifyRequest } from "fastify"
import { TransactionQuery } from "@transaction/schema"
import { getTransactions } from "@transaction/services"


export async function getTransactionsHandler (
  req: FastifyRequest<{ Querystring: TransactionQuery }>,
  res: FastifyReply,
) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getTransactions(req.query, userId);
  return res.code(200).send(result);
}