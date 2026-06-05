import { FilterQuery, Types } from 'mongoose';

import { TransactionStatisticsQuery } from '@transaction/schema';
import { ValidationError } from '@utils/errors';

const getObjectIdMatch = (ids: string[]) => {
  const objectIds = ids.map((id) => new Types.ObjectId(id));

  return objectIds.length === 1 ? objectIds[0] : { $in: objectIds };
};

const getExcludedObjectIdMatch = (ids: string[]) => ({
  $nin: ids.map((id) => new Types.ObjectId(id)),
});

export const getStatisticsMatching = (q: TransactionStatisticsQuery, userId: string) => {
  if (q.categoryIds && q.excludeCategoryIds) {
    throw new ValidationError(
      `'categoryIds' and 'excludeCategoryIds' cannot be provided together in query`,
    );
  }
  if (q.paymentMethodIds && q.excludePaymentMethodIds) {
    throw new ValidationError(
      `'paymentMethodIds' and 'excludePaymentMethodIds' cannot be provided together in query`,
    );
  }
  if (q.accountIds && q.excludeAccountIds) {
    throw new ValidationError(
      `'accountIds' and 'excludeAccountIds' cannot be provided together in query`,
    );
  }

  const matching: FilterQuery<unknown> = {};
  if (q.year && !q.month) {
    matching.date = {
      $gte: new Date(`${q.year}/01/01`),
      $lt: new Date(`${q.year + 1}/01/01`),
    };
  }
  if (q.month && !q.year) matching.$expr = { $eq: [{ $month: '$date' }, q.month] };
  if (q.month && q.year) {
    matching.date = {
      $gte: new Date(`${q.year}/${String(q.month).padStart(2, '0')}/01`),
      $lt: new Date(
        `${q.month === 12 ? q.year + 1 : q.year}/` +
          `${String(q.month === 12 ? 1 : q.month + 1).padStart(2, '0')}/01`,
      ),
    };
  }

  matching.ownerId = new Types.ObjectId(userId);
  matching.deletion = null;
  matching.transactionType = q.transactionType;
  matching.currency = q.currency;

  if (q.categoryIds) matching.categoryId = getObjectIdMatch(q.categoryIds);
  if (q.excludeCategoryIds)
    matching.categoryId = getExcludedObjectIdMatch(q.excludeCategoryIds);
  if (q.paymentMethodIds) matching.paymentMethodId = getObjectIdMatch(q.paymentMethodIds);
  if (q.excludePaymentMethodIds)
    matching.paymentMethodId = getExcludedObjectIdMatch(q.excludePaymentMethodIds);
  if (q.accountIds) matching.accountId = getObjectIdMatch(q.accountIds);
  if (q.excludeAccountIds)
    matching.accountId = getExcludedObjectIdMatch(q.excludeAccountIds);

  return matching;
};
