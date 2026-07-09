import { FilterQuery } from 'mongoose';

import { ITransaction, TransactionModel } from '@transaction/model';

export const findTransactionResourceIds = async (filter: FilterQuery<ITransaction>) => {
  // TODO: Consider replacing these 3 distinct queries with a single aggregation
  // if filtered exports become a performance hotspot.
  const [accountIds, categoryIds, paymentMethodIds] = await Promise.all([
    TransactionModel.distinct('accountId', filter),
    TransactionModel.distinct('categoryId', filter),
    TransactionModel.distinct('paymentMethodId', filter),
  ]);

  return {
    accountIds: accountIds.map((id) => id.toString()),
    categoryIds: categoryIds.map((id) => id.toString()),
    paymentMethodIds: paymentMethodIds.map((id) => id.toString()),
  };
};
