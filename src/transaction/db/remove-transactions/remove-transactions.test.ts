import { afterEach, describe, expect, it, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import { TransactionModel } from '@transaction/model';

import { removeTransactions } from './remove-transactions';

describe('removeTransactions', () => {
  const deleteResult = { deletedCount: 100 };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['filter by `ownerId`', USER_ID_STR, { ownerId: USER_ID_STR }],
    ['do not filter', undefined, {}],
  ])('%s', async (_, ownerId, query) => {
    vi.spyOn(TransactionModel, 'deleteMany').mockResolvedValue(deleteResult as any);

    const result = await removeTransactions(ownerId);

    expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
    expect(TransactionModel.deleteMany).toHaveBeenCalledWith(query);
    expect(result).toEqual(deleteResult);
  });

  it.each([
    ['active', 'active', { ownerId: USER_ID_STR, deletion: null }],
    ['trash', 'trash', { ownerId: USER_ID_STR, 'deletion.deletedAt': { $exists: true } }],
  ])('filters by deletion state %s', async (_, deletionState, query) => {
    vi.spyOn(TransactionModel, 'deleteMany').mockResolvedValue(deleteResult as any);

    const result = await removeTransactions(USER_ID_STR, deletionState as any);

    expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
    expect(TransactionModel.deleteMany).toHaveBeenCalledWith(query);
    expect(result).toEqual(deleteResult);
  });
});
