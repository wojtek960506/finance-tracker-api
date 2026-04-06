import { describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import {
  getStandardTransactionResultJSON,
  STANDARD_TXN_ID_STR,
} from '@testing/factories/transaction';
import { findTransaction, removeTransaction } from '@transaction/db';
import { deleteTransaction } from '@transaction/services';

vi.mock('@transaction/db', () => ({
  findTransaction: vi.fn(),
  removeTransaction: vi.fn(),
}));

describe('deleteTransaction', () => {
  it('delete transaction', async () => {
    const deleteResult = { acknowledged: true, deletedCount: 1 };
    const transaction = getStandardTransactionResultJSON();
    (findTransaction as Mock).mockResolvedValue(transaction);
    (removeTransaction as Mock).mockResolvedValue(deleteResult);

    const result = await deleteTransaction(STANDARD_TXN_ID_STR, USER_ID_STR);

    expect(findTransaction).toHaveBeenCalledOnce();
    expect(findTransaction).toHaveBeenCalledWith(STANDARD_TXN_ID_STR);
    expect(removeTransaction).toHaveBeenCalledOnce();
    expect(removeTransaction).toHaveBeenCalledWith(STANDARD_TXN_ID_STR, undefined);
    expect(result).toEqual(deleteResult);
  });
});
