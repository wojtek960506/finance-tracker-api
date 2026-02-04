import { CategoryModel } from "@models/category-model";
import { FilteredResponse } from "@routes/routes-types";
import { serializeTransaction } from "@schemas/serializers";
import { TransactionQuery } from "@schemas/transaction-query";
import { TransactionsResponseDTO } from "@schemas/transaction";
import { buildTransactionFilterQuery } from "@services/transactions";
import { findTransactions, findTransactionsCount } from "@db/transactions";


export const getTransactions = async (
  query: TransactionQuery,
  userId: string,
): Promise<FilteredResponse<TransactionsResponseDTO>> => {
  const filter = buildTransactionFilterQuery(query, userId);

  const [transactions, total] = await Promise.all([
    findTransactions(filter, query),
    findTransactionsCount(filter),
  ]);

  const totalPages = Math.ceil(total / query.limit);

  const categoryIds = transactions.map(t => t.categoryId.toString());
  const categories = await CategoryModel.find({
    ownerId: { $in: [userId, undefined] },
    _id: { $in: categoryIds },
  }).lean();

  const categoriesMap = Object.fromEntries(categories.map(
    c => [c._id.toString(), { id: c._id.toString(), type: c.type, name: c.name }]
  ));

  return {
    page: query.page,
    limit: query.limit,
    total,
    totalPages,
    items: transactions.map(
      transaction => serializeTransaction(transaction, categoriesMap)
    )
  }
}
