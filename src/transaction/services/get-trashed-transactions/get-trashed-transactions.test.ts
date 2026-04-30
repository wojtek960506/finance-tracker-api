import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import * as transactionServices from '@transaction/services';

import { listTransactions } from '../list-transactions';

import { getTrashedTransactions } from './get-trashed-transactions';

vi.mock('../list-transactions', () => ({
  listTransactions: vi.fn(),
}));

describe('getTrashedTransactions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('builds trash filter and delegates to listTransactions', async () => {
    const query = { page: 1, limit: 10, sortBy: 'deletedAt', sortOrder: 'desc' } as any;
    const filter = { ownerId: USER_ID_STR, 'deletion.deletedAt': { $exists: true } };
    const response = { page: 1, limit: 10, total: 0, totalPages: 0, items: [] };
    vi.spyOn(transactionServices, 'buildTransactionFilterQuery').mockReturnValue(
      filter as any,
    );
    (listTransactions as Mock).mockResolvedValue(response);

    const result = await getTrashedTransactions(query, USER_ID_STR);

    expect(transactionServices.buildTransactionFilterQuery).toHaveBeenCalledWith(
      query,
      USER_ID_STR,
      'trash',
    );
    expect(listTransactions).toHaveBeenCalledOnce();
    expect((listTransactions as Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({
        filter,
        query,
        userId: USER_ID_STR,
        serialize: expect.any(Function),
      }),
    );
    expect(result).toEqual(response);
  });
});
