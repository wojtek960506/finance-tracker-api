import { validateSchema } from "@utils/validation";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionModel } from "@models/transaction-model";
import { buildTransactionFilterQuery } from "@/services/transactions";
import { TransactionTotalsQuerySchema } from "@schemas/transaction-query";
import {
  parseTotalsByCurrencyResult,
  parseTotalsOverallResult
} from "./parse-totals-result";


export async function getTransactionTotalsHandler(
  req: FastifyRequest, _res: FastifyReply
) {
  const q = validateSchema(TransactionTotalsQuerySchema, req.query);
  
  const filter = buildTransactionFilterQuery(q, (req as AuthenticatedRequest).userId);
  if (q.excludeCategories && !q.category) filter.category = { $nin: q.excludeCategories }

  const totalsByCurrency = await TransactionModel.aggregate([
    { $match: filter },
    { $group: { 
      _id: {
        currency: "$currency",
        transactionType: "$transactionType"
      },
      totalAmount: { $sum: "$amount" },
      totalItems: { $sum: 1 },
      averageAmount: { $avg: "$amount" },
      maxAmount: { $max: "$amount" },
      minAmount: { $min: "$amount" },
    }},
    { $sort: { "_id.currency": 1, "_id.transactionType": 1 } }
  ]);

  const totalsOverall = await TransactionModel.aggregate([
    { $match: filter },
    { $group: {
      _id: { transactionType: "$transactionType" },
      totalItems: { $sum: 1 },
    }},
    { $sort: {"_id.transactionType": 1 } }
  ])

  return {
    byCurrency: parseTotalsByCurrencyResult(totalsByCurrency),
    overall: parseTotalsOverallResult(totalsOverall),
  }
}