import { FilterQuery, Types } from 'mongoose';

import { ITransaction } from '@transaction/model';
import { TransactionFiltersQuery } from '@transaction/schema';
import { ValidationError } from '@utils/errors';

const getObjectIdMatch = (ids: string[]) => {
  const objectIds = ids.map((id) => new Types.ObjectId(id));

  return objectIds.length === 1 ? objectIds[0] : { $in: objectIds };
};

const getExcludedObjectIdMatch = (ids: string[]) => ({
  $nin: ids.map((id) => new Types.ObjectId(id)),
});

export const buildTransactionFilterQuery = (
  q: TransactionFiltersQuery,
  ownerId: string,
  deletionState: 'active' | 'trash' | 'any' = 'active',
): FilterQuery<ITransaction> => {
  if (q.categoryId && q.excludeCategoryIds) {
    throw new ValidationError(
      `'categoryId' and 'excludeCategoryIds' cannot be provided together in query`,
    );
  }
  if (q.paymentMethodId && q.excludePaymentMethodIds) {
    throw new ValidationError(
      `'paymentMethodId' and 'excludePaymentMethodIds' cannot be provided together in query`,
    );
  }
  if (q.accountId && q.excludeAccountIds) {
    throw new ValidationError(
      `'accountId' and 'excludeAccountIds' cannot be provided together in query`,
    );
  }

  const query: FilterQuery<ITransaction> = {};

  if (q.transactionType) query.transactionType = q.transactionType;
  if (q.currency) query.currency = q.currency;
  if (q.paymentMethodId) query.paymentMethodId = getObjectIdMatch(q.paymentMethodId);
  if (q.excludePaymentMethodIds)
    query.paymentMethodId = getExcludedObjectIdMatch(q.excludePaymentMethodIds);
  if (q.accountId) query.accountId = getObjectIdMatch(q.accountId);
  if (q.excludeAccountIds) query.accountId = getExcludedObjectIdMatch(q.excludeAccountIds);

  if (q.categoryId) query.categoryId = getObjectIdMatch(q.categoryId);
  if (q.excludeCategoryIds) query.categoryId = getExcludedObjectIdMatch(q.excludeCategoryIds);

  if (q.minAmount || q.maxAmount) {
    query.amount = {};
    if (q.minAmount) query.amount.$gte = q.minAmount;
    if (q.maxAmount) query.amount.$lte = q.maxAmount;
  }

  if (q.startDate || q.endDate) {
    query.date = {};
    if (q.startDate) query.date.$gte = q.startDate;
    if (q.endDate) query.date.$lte = q.endDate;
  }

  // always fitler transactions by query id
  query.ownerId = new Types.ObjectId(ownerId);
  if (deletionState === 'active') query.deletion = null;
  if (deletionState === 'trash') query['deletion.deletedAt'] = { $exists: true };

  return query;
};
