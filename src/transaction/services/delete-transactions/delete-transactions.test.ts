import { afterEach, describe, expect, it, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import * as dbT from '@transaction/db';

import { deleteTransactions } from './delete-transactions';

describe('deleteTransactions', () => {
  const deleteResult = { deletedCount: 100 };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('delete transactions for test user', async () => {
    vi.spyOn(dbT, 'removeTransactions').mockResolvedValue(deleteResult as any);

    const result = await deleteTransactions(USER_ID_STR);
    expect(dbT.removeTransactions).toHaveBeenCalledOnce();
    expect(dbT.removeTransactions).toHaveBeenCalledWith(USER_ID_STR);
    expect(result).toEqual(deleteResult);
  });
});
