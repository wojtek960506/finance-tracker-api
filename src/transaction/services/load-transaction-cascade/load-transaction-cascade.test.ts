import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_OBJ, USER_ID_STR } from '@testing/factories/general';
import {
  getStandardTransactionResultJSON,
  getTransferTransactionResultJSON,
  STANDARD_TXN_ID_STR,
  TRANSFER_TXN_EXPENSE_ID_STR,
  TRANSFER_TXN_INCOME_ID_STR,
} from '@testing/factories/transaction';
import { findTransaction } from '@transaction/db';
import { loadOwnedTransactionCascade } from '@transaction/services/load-transaction-cascade';

vi.mock('@transaction/db', () => ({
  findTransaction: vi.fn(),
}));

describe('loadOwnedTransactionCascade', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns only main transaction when there is no reference', async () => {
    const transaction = getStandardTransactionResultJSON();
    (findTransaction as Mock).mockResolvedValue(transaction);

    const result = await loadOwnedTransactionCascade(STANDARD_TXN_ID_STR, USER_ID_STR);

    expect(findTransaction).toHaveBeenCalledOnce();
    expect(findTransaction).toHaveBeenCalledWith(STANDARD_TXN_ID_STR, {});
    expect(result).toEqual({
      transaction,
      reference: undefined,
      ids: [STANDARD_TXN_ID_STR],
    });
  });

  it('loads referenced transaction as well', async () => {
    const { expenseTransactionJSON, incomeTransactionJSON } =
      getTransferTransactionResultJSON();
    (findTransaction as Mock)
      .mockResolvedValueOnce({
        ...expenseTransactionJSON,
        ownerId: USER_ID_OBJ,
      })
      .mockResolvedValueOnce({
        ...incomeTransactionJSON,
        ownerId: USER_ID_OBJ,
      });

    const result = await loadOwnedTransactionCascade(
      TRANSFER_TXN_EXPENSE_ID_STR,
      USER_ID_STR,
      { deletionState: 'trash' },
    );

    expect(findTransaction).toHaveBeenNthCalledWith(1, TRANSFER_TXN_EXPENSE_ID_STR, {
      deletionState: 'trash',
    });
    expect(findTransaction).toHaveBeenNthCalledWith(2, TRANSFER_TXN_INCOME_ID_STR, {
      deletionState: 'trash',
    });
    expect(result.ids).toEqual([TRANSFER_TXN_EXPENSE_ID_STR, TRANSFER_TXN_INCOME_ID_STR]);
    expect(result.reference?._id.toString()).toBe(TRANSFER_TXN_INCOME_ID_STR);
  });
});
