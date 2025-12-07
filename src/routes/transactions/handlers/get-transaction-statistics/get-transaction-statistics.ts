import { TransactionModel } from "@models/transaction-model";
import { AuthenticatedRequest } from "@routes/types";
import { transactionStatisticsQuerySchema } from "@schemas/transaction-query";
import { validateSchema } from "@utils/validation";
import { FastifyReply, FastifyRequest } from "fastify";
import { getStatisticsGrouping } from "./get-statistics-grouping";
import { getStatisticsMatching } from "./get-statistics-matching";
import { parseStatisticsResult } from "./parse-result";

export async function getTransactionStatisticsHandler(
  req: FastifyRequest, _res: FastifyReply
) {
  const q = validateSchema(transactionStatisticsQuerySchema, req.query);

  const result = await TransactionModel.aggregate([
    getStatisticsMatching(q, (req as AuthenticatedRequest).userId),
    getStatisticsGrouping(q)
  ])

  return parseStatisticsResult(result, q)
}