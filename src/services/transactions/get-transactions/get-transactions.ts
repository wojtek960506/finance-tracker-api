import { FilteredResponse } from "@routes/routes-types";
import { TransactionModel } from "@models/transaction-model";
import { TransactionQuery } from "@schemas/transaction-query";
import { TransactionsResponseDTO } from "@schemas/transaction";
import { buildTransactionFilterQuery } from "@services/transactions";
import { serializeTransaction } from "@schemas/serialize-transaction";


export const getTransactions = async (
  q: TransactionQuery,
  userId: string,
): Promise<FilteredResponse<TransactionsResponseDTO>> => {
  const filter = buildTransactionFilterQuery(q, userId);
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

  return {
    page: q.page,
    limit: q.limit,
    total,
    totalPages,
    items: transactions.map(transaction => serializeTransaction(transaction))
  }
}