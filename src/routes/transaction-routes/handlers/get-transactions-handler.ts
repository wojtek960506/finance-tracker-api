import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionQuery } from "@schemas/transaction-query";
import { getTransactions } from "@services/transactions/get-transactions";


export async function getTransactionsHandler (
  req: FastifyRequest<{ Querystring: TransactionQuery }>,
  res: FastifyReply,
) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getTransactions(req.query, userId);
  return res.code(200).send(result);
}