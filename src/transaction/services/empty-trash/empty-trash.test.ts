import { describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import { removeTransactions } from '@transaction/db';

import { emptyTrash } from './empty-trash';

vi.mock('@transaction/db', () => ({
  removeTransactions: vi.fn(),
}));

describe('emptyTrash', () => {
  it('removes only trashed transactions', async () => {
    const result = { acknowledged: true, deletedCount: 5 };
    (removeTransactions as Mock).mockResolvedValue(result);

    const response = await emptyTrash(USER_ID_STR);

    expect(removeTransactions).toHaveBeenCalledWith(USER_ID_STR, 'trash');
    expect(response).toEqual(result);
  });
});
