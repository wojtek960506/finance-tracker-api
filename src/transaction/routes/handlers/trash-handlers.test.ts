import { describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import { STANDARD_TXN_ID_STR } from '@testing/factories/transaction';
import * as transactionServices from '@transaction/services';

import { deleteTrashedTransactionHandler } from './delete-trashed-transaction-handler';
import { emptyTrashHandler } from './empty-trash-handler';
import { getTrashedTransactionHandler } from './get-trashed-transaction-handler';
import { getTrashedTransactionsHandler } from './get-trashed-transactions-handler';
import { restoreTransactionHandler } from './restore-transaction-handler';
import { restoreTransactionsHandler } from './restore-transactions-handler';

vi.mock('@transaction/services', () => ({
  deleteTrashedTransaction: vi.fn(),
  emptyTrash: vi.fn(),
  getTrashedTransaction: vi.fn(),
  getTrashedTransactions: vi.fn(),
  restoreTransaction: vi.fn(),
  restoreTransactions: vi.fn(),
}));

const createReply = () => {
  const send = vi.fn();
  const code = vi.fn().mockReturnValue({ send });
  return { code, send };
};

describe('trash handlers', () => {
  it('getTrashedTransactionsHandler', async () => {
    const query = { page: 1, limit: 20, sortBy: 'deletedAt', sortOrder: 'desc' };
    const reply = createReply();
    const result = { items: [], page: 1, limit: 20, total: 0, totalPages: 0 };
    (transactionServices.getTrashedTransactions as Mock).mockResolvedValue(result);

    await getTrashedTransactionsHandler(
      { query, userId: USER_ID_STR } as any,
      reply as any,
    );

    expect(transactionServices.getTrashedTransactions).toHaveBeenCalledWith(
      query,
      USER_ID_STR,
    );
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith(result);
  });

  it('getTrashedTransactionHandler', async () => {
    const reply = createReply();
    const result = { id: STANDARD_TXN_ID_STR };
    (transactionServices.getTrashedTransaction as Mock).mockResolvedValue(result);

    await getTrashedTransactionHandler(
      { params: { id: STANDARD_TXN_ID_STR }, userId: USER_ID_STR } as any,
      reply as any,
    );

    expect(transactionServices.getTrashedTransaction).toHaveBeenCalledWith(
      STANDARD_TXN_ID_STR,
      USER_ID_STR,
    );
    expect(reply.send).toHaveBeenCalledWith(result);
  });

  it('restoreTransactionHandler', async () => {
    const reply = createReply();
    const result = { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
    (transactionServices.restoreTransaction as Mock).mockResolvedValue(result);

    await restoreTransactionHandler(
      { params: { id: STANDARD_TXN_ID_STR }, userId: USER_ID_STR } as any,
      reply as any,
    );

    expect(transactionServices.restoreTransaction).toHaveBeenCalledWith(
      STANDARD_TXN_ID_STR,
      USER_ID_STR,
    );
    expect(reply.send).toHaveBeenCalledWith(result);
  });

  it('restoreTransactionsHandler', async () => {
    const reply = createReply();
    const result = { acknowledged: true, matchedCount: 2, modifiedCount: 2 };
    (transactionServices.restoreTransactions as Mock).mockResolvedValue(result);

    await restoreTransactionsHandler({ userId: USER_ID_STR } as any, reply as any);

    expect(transactionServices.restoreTransactions).toHaveBeenCalledWith(USER_ID_STR);
    expect(reply.send).toHaveBeenCalledWith(result);
  });

  it('deleteTrashedTransactionHandler', async () => {
    const reply = createReply();
    const result = { acknowledged: true, deletedCount: 1 };
    (transactionServices.deleteTrashedTransaction as Mock).mockResolvedValue(result);

    await deleteTrashedTransactionHandler(
      { params: { id: STANDARD_TXN_ID_STR }, userId: USER_ID_STR } as any,
      reply as any,
    );

    expect(transactionServices.deleteTrashedTransaction).toHaveBeenCalledWith(
      STANDARD_TXN_ID_STR,
      USER_ID_STR,
    );
    expect(reply.send).toHaveBeenCalledWith(result);
  });

  it('emptyTrashHandler', async () => {
    const reply = createReply();
    const result = { acknowledged: true, deletedCount: 2 };
    (transactionServices.emptyTrash as Mock).mockResolvedValue(result);

    await emptyTrashHandler({ userId: USER_ID_STR } as any, reply as any);

    expect(transactionServices.emptyTrash).toHaveBeenCalledWith(USER_ID_STR);
    expect(reply.send).toHaveBeenCalledWith(result);
  });
});
