import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { getTransactionStatistics } from "@services/transactions";
import { TransactionStatisticsQuery } from "@schemas/transaction-query";


export async function getTransactionStatisticsHandler(
  req: FastifyRequest<{ Querystring: TransactionStatisticsQuery }>,
  res: FastifyReply
) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getTransactionStatistics(req.query, userId);
  return res.code(200).send(result);
}