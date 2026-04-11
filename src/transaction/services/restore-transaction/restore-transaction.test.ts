import { describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import {
  STANDARD_TXN_ID_STR,
  TRANSFER_TXN_INCOME_ID_STR,
} from '@testing/factories/transaction';
import { updateTransactionsDeletion } from '@transaction/db';
import { loadOwnedTransactionCascade } from '@transaction/services/load-transaction-cascade';
import { NotFoundError } from '@utils/errors';

import { restoreTransaction } from './restore-transaction';

vi.mock('@transaction/db', () => ({
  updateTransactionsDeletion: vi.fn(),
}));
vi.mock('@transaction/services/load-transaction-cascade', () => ({
  loadOwnedTransactionCascade: vi.fn(),
}));

describe('restoreTransaction', () => {
  it('restores all ids from cascade', async () => {
    const result = { acknowledged: true, matchedCount: 2, modifiedCount: 2 };
    (loadOwnedTransactionCascade as Mock).mockResolvedValue({
      ids: [STANDARD_TXN_ID_STR, TRANSFER_TXN_INCOME_ID_STR],
    });
    (updateTransactionsDeletion as Mock).mockResolvedValue(result);

    const response = await restoreTransaction(STANDARD_TXN_ID_STR, USER_ID_STR);

    expect(loadOwnedTransactionCascade).toHaveBeenCalledWith(
      STANDARD_TXN_ID_STR,
      USER_ID_STR,
      {
        deletionState: 'trash',
      },
    );
    expect(updateTransactionsDeletion).toHaveBeenCalledWith([
      { id: STANDARD_TXN_ID_STR, deletion: null },
      { id: TRANSFER_TXN_INCOME_ID_STR, deletion: null },
    ]);
    expect(response).toEqual(result);
  });

  it('throws when not all ids were restored', async () => {
    (loadOwnedTransactionCascade as Mock).mockResolvedValue({
      ids: [STANDARD_TXN_ID_STR, TRANSFER_TXN_INCOME_ID_STR],
    });
    (updateTransactionsDeletion as Mock).mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
    });

    await expect(restoreTransaction(STANDARD_TXN_ID_STR, USER_ID_STR)).rejects.toThrow(
      NotFoundError,
    );
  });
});
