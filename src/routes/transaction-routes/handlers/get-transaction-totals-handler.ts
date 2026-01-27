import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { getTransactionTotals } from "@services/transactions";
import { TransactionTotalsQuery } from "@schemas/transaction-query";


export async function getTransactionTotalsHandler(
  req: FastifyRequest<{ Querystring: TransactionTotalsQuery }>,
  res: FastifyReply
) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getTransactionTotals(req.query, userId);
  return res.code(200).send(result);
}