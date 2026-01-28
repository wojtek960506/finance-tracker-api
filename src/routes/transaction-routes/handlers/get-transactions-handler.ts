import { FastifyReply, FastifyRequest } from "fastify";
import { getTransactions } from "@services/transactions";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionQuery } from "@schemas/transaction-query";


export async function getTransactionsHandler (
  req: FastifyRequest<{ Querystring: TransactionQuery }>,
  res: FastifyReply,
) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getTransactions(req.query, userId);
  return res.code(200).send(result);
}