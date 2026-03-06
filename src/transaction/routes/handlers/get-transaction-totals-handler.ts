import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@shared/http";
import { getTransactionTotals } from "@transaction/services";
import { TransactionFiltersQuery } from "@transaction/schema";


export async function getTransactionTotalsHandler(
  req: FastifyRequest<{ Querystring: TransactionFiltersQuery }>,
  res: FastifyReply
) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getTransactionTotals(req.query, userId);
  return res.code(200).send(result);
}