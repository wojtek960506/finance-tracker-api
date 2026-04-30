import { describe, expect, it, Mock, vi } from 'vitest';

import {
  STANDARD_TXN_ID_STR,
  TRANSFER_TXN_INCOME_ID_STR,
} from '@testing/factories/transaction';
import { removeTransaction } from '@transaction/db';
import { loadOwnedTransactionCascade } from '@transaction/services/load-transaction-cascade';

import { deleteTrashedTransaction } from './delete-trashed-transaction';

vi.mock('@transaction/db', () => ({
  removeTransaction: vi.fn(),
}));
vi.mock('@transaction/services/load-transaction-cascade', () => ({
  loadOwnedTransactionCascade: vi.fn(),
}));

describe('deleteTrashedTransaction', () => {
  it('deletes selected trashed transaction and its reference', async () => {
    const result = { acknowledged: true, deletedCount: 2 };
    (loadOwnedTransactionCascade as Mock).mockResolvedValue({
      transaction: { _id: { toString: () => STANDARD_TXN_ID_STR } },
      reference: { _id: { toString: () => TRANSFER_TXN_INCOME_ID_STR } },
    });
    (removeTransaction as Mock).mockResolvedValue(result);

    const response = await deleteTrashedTransaction(STANDARD_TXN_ID_STR, 'user-1');

    expect(loadOwnedTransactionCascade).toHaveBeenCalledWith(
      STANDARD_TXN_ID_STR,
      'user-1',
      {
        deletionState: 'trash',
      },
    );
    expect(removeTransaction).toHaveBeenCalledWith(
      STANDARD_TXN_ID_STR,
      TRANSFER_TXN_INCOME_ID_STR,
    );
    expect(response).toEqual(result);
  });
});
