import { describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import {
  getStandardTransactionResultJSON,
  STANDARD_TXN_ID_STR,
} from '@testing/factories/transaction';
import { findTransaction, updateTransactionsDeletion } from '@transaction/db';
import { deleteTransaction } from '@transaction/services';

vi.mock('@transaction/db', () => ({
  findTransaction: vi.fn(),
  updateTransactionsDeletion: vi.fn(),
}));

describe('deleteTransaction', () => {
  it('delete transaction', async () => {
    const deleteResult = { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
    const transaction = getStandardTransactionResultJSON();
    (findTransaction as Mock).mockResolvedValue(transaction);
    (updateTransactionsDeletion as Mock).mockResolvedValue(deleteResult);

    const result = await deleteTransaction(STANDARD_TXN_ID_STR, USER_ID_STR);

    expect(findTransaction).toHaveBeenCalledOnce();
    expect(findTransaction).toHaveBeenCalledWith(STANDARD_TXN_ID_STR, {});
    expect(updateTransactionsDeletion).toHaveBeenCalledOnce();
    expect(updateTransactionsDeletion).toHaveBeenCalledWith([
      {
        id: STANDARD_TXN_ID_STR,
        deletion: expect.objectContaining({}),
      },
    ]);
    expect(result).toEqual(deleteResult);
  });
});
