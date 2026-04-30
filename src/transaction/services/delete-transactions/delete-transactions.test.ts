import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import {
  getStandardTransactionNotPopulatedResultJSON,
  STANDARD_TXN_ID_STR,
} from '@testing/factories/transaction';
import * as dbT from '@transaction/db';
import { TransactionModel } from '@transaction/model';

import { deleteTransactions } from './delete-transactions';

vi.mock('@transaction/model', () => ({ TransactionModel: { find: vi.fn() } }));

describe('deleteTransactions', () => {
  const deleteResult = { acknowledged: true, matchedCount: 1, modifiedCount: 1 };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('delete transactions for test user', async () => {
    vi.spyOn(dbT, 'updateTransactionsDeletion').mockResolvedValue(deleteResult as any);
    (TransactionModel.find as Mock).mockReturnValue({
      select: vi.fn().mockResolvedValue([getStandardTransactionNotPopulatedResultJSON()]),
    });

    const result = await deleteTransactions(USER_ID_STR);

    expect(TransactionModel.find).toHaveBeenCalledOnce();
    expect(dbT.updateTransactionsDeletion).toHaveBeenCalledOnce();
    expect(dbT.updateTransactionsDeletion).toHaveBeenCalledWith([
      {
        id: STANDARD_TXN_ID_STR,
        deletion: expect.objectContaining({}),
      },
    ]);
    expect(result).toEqual(deleteResult);
  });
});
