import { FilterQuery } from 'mongoose';

import { ITransaction, TransactionModel } from '@transaction/model';

export const findTransactionResourceIds = async (filter: FilterQuery<ITransaction>) => {
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
