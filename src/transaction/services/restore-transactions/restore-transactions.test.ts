import { Types } from 'mongoose';
import { describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import { updateTransactionsDeletionByFilter } from '@transaction/db';

import { restoreTransactions } from './restore-transactions';

vi.mock('@transaction/db', () => ({
  updateTransactionsDeletionByFilter: vi.fn(),
}));

describe('restoreTransactions', () => {
  it('restores all trashed transactions for user', async () => {
    const result = { acknowledged: true, matchedCount: 3, modifiedCount: 3 };
    (updateTransactionsDeletionByFilter as Mock).mockResolvedValue(result);

    const response = await restoreTransactions(USER_ID_STR);

    expect(updateTransactionsDeletionByFilter).toHaveBeenCalledWith(
      {
        ownerId: expect.any(Types.ObjectId),
        'deletion.deletedAt': { $exists: true },
      },
      null,
    );
    expect(
      (
        (updateTransactionsDeletionByFilter as Mock).mock.calls[0][0]
          .ownerId as Types.ObjectId
      ).toString(),
    ).toBe(USER_ID_STR);
    expect(response).toEqual(result);
  });
});
