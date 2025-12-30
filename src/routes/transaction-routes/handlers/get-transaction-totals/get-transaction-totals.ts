import { validateSchema } from "@utils/validation";
import { FastifyReply, FastifyRequest } from "fastify";
import { parseTotalsResult } from "./parse-totals-result";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionModel } from "@models/transaction-model";
import { transactionTotalsQuerySchema } from "@schemas/transaction-query";
import { buildTransactionFilterQuery } from "@/services/build-transaction-query";


export async function getTransactionTotalsHandler(
  req: FastifyRequest, _res: FastifyReply
) {
  const q = validateSchema(transactionTotalsQuerySchema, req.query);
  
  const filter = buildTransactionFilterQuery(q, (req as AuthenticatedRequest).userId);
  if (q.excludeCategories && !q.category) filter.category = { $nin: q.excludeCategories }

  const transactions = await TransactionModel.aggregate([
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

  return parseTotalsResult(transactions);
}