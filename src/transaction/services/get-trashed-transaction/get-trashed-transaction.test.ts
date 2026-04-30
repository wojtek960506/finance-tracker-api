import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import {
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
  getTransferTransactionResultJSON,
  getTransferTransactionResultSerialized,
  STANDARD_TXN_ID_STR,
} from '@testing/factories/transaction';
import { serializeTrashedTransaction } from '@transaction/serializers';
import { loadOwnedTransactionDetails } from '@transaction/services/get-transaction';

import { getTrashedTransaction } from './get-trashed-transaction';

vi.mock('@transaction/services/get-transaction', () => ({
  loadOwnedTransactionDetails: vi.fn(),
}));
vi.mock('@transaction/serializers', () => ({
  serializeTrashedTransaction: vi.fn(),
}));

describe('getTrashedTransaction', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns trashed transaction without reference', async () => {
    const transaction = getStandardTransactionResultJSON();
    const serialized = {
      ...getStandardTransactionResultSerialized(),
      deletion: {
        deletedAt: new Date('2026-01-01'),
        purgeAt: new Date('2026-02-01'),
      },
    };
    (loadOwnedTransactionDetails as Mock).mockResolvedValue({
      transaction,
      reference: undefined,
    });
    (serializeTrashedTransaction as Mock).mockReturnValue(serialized);

    const result = await getTrashedTransaction(STANDARD_TXN_ID_STR, 'user-1');

    expect(loadOwnedTransactionDetails).toHaveBeenCalledWith(
      STANDARD_TXN_ID_STR,
      'user-1',
      {
        deletionState: 'trash',
      },
    );
    expect(result).toEqual(serialized);
  });

  it('includes serialized reference when present', async () => {
    const { expenseTransactionJSON, incomeTransactionJSON } =
      getTransferTransactionResultJSON();
    const { expenseTransactionSerialized, incomeTransactionSerialized } =
      getTransferTransactionResultSerialized();
    const serialized = {
      ...expenseTransactionSerialized,
      deletion: {
        deletedAt: new Date('2026-01-01'),
        purgeAt: new Date('2026-02-01'),
      },
    };
    const serializedReference = {
      ...incomeTransactionSerialized,
      deletion: {
        deletedAt: new Date('2026-01-01'),
        purgeAt: new Date('2026-02-01'),
      },
    };
    (loadOwnedTransactionDetails as Mock).mockResolvedValue({
      transaction: expenseTransactionJSON,
      reference: incomeTransactionJSON,
    });
    (serializeTrashedTransaction as Mock)
      .mockReturnValueOnce(serialized)
      .mockReturnValueOnce(serializedReference);

    const result = await getTrashedTransaction(STANDARD_TXN_ID_STR, 'user-1');

    expect(serializeTrashedTransaction).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      ...serialized,
      reference: serializedReference,
    });
  });
});
