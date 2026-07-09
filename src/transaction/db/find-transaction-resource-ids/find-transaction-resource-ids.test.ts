import { describe, expect, it, Mock, vi } from 'vitest';

import { TransactionModel } from '@transaction/model';
import { randomObjectIdString } from '@utils/random';

import { findTransactionResourceIds } from './find-transaction-resource-ids';

vi.mock('@transaction/model', () => ({
  TransactionModel: { distinct: vi.fn() },
}));

describe('findTransactionResourceIds', () => {
  it('finds distinct transaction resource ids', async () => {
    const FILTER = {
      ownerId: randomObjectIdString(),
      deletion: null,
    };
    const accountId = randomObjectIdString();
    const categoryId = randomObjectIdString();
    const paymentMethodId = randomObjectIdString();

    (TransactionModel.distinct as Mock)
      .mockResolvedValueOnce([accountId])
      .mockResolvedValueOnce([categoryId])
      .mockResolvedValueOnce([paymentMethodId]);

    const result = await findTransactionResourceIds(FILTER as any);

    expect(result).toEqual({
      accountIds: [accountId],
      categoryIds: [categoryId],
      paymentMethodIds: [paymentMethodId],
    });
    expect(TransactionModel.distinct).toHaveBeenNthCalledWith(1, 'accountId', FILTER);
    expect(TransactionModel.distinct).toHaveBeenNthCalledWith(2, 'categoryId', FILTER);
    expect(TransactionModel.distinct).toHaveBeenNthCalledWith(
      3,
      'paymentMethodId',
      FILTER,
    );
  });
});
