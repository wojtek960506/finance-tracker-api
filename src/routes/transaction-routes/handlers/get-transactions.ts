import { validateSchema } from "@utils/validation";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";
import { TransactionModel } from "@models/transaction-model";
import { TransactionQuerySchema } from "@schemas/transaction-query";
import { buildTransactionFilterQuery } from "@services/transactions";
import { serializeTransaction } from "@schemas/serialize-transaction";



export async function getTransactionsHandler (
  req: FastifyRequest, res: FastifyReply
) {
  const q = validateSchema(TransactionQuerySchema, req.query);

  const filter = buildTransactionFilterQuery(q, (req as AuthenticatedRequest).userId);
  const skip = (q.page - 1) * q.limit;

  const [transactions, total] = await Promise.all([
    TransactionModel
      .find(filter)
      .sort({
        [q.sortBy]: q.sortOrder === "asc" ? 1 : -1,
        sourceIndex: q.sortOrder === "asc" ? 1 : -1,
      })
      .skip(skip)
      .limit(q.limit),
    TransactionModel.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / q.limit);

  return res.send({
    page: q.page,
    limit: q.limit,
    total,
    totalPages,
    items: transactions.map(transaction => serializeTransaction(transaction))
  })
}