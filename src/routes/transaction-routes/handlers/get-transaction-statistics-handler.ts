import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { getTransactionStatistics } from "@services/transactions";
import { TransactionStatisticsQuery } from "@schemas/transaction-query";


// it is possible to group by
  // - just month (then we get all time statistics for month and grouped by a year)
  // - just year (then we get all statistics from given year and grouped by month in a given year)
  // - year and month - then we get all statistics from a given month of the given year
  // additionally we can filter it by category or payment method or account
export async function getTransactionStatisticsHandler(
  req: FastifyRequest<{ Querystring: TransactionStatisticsQuery }>,
  res: FastifyReply
) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getTransactionStatistics(req.query, userId);
  return res.code(200).send(result);
}