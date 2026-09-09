import { describe, expect, it, vi } from 'vitest';

vi.mock('@transaction/db', () => ({
  findTransactions: vi.fn(),
  findTransactionsCount: vi.fn(),
}));
vi.mock('@named-resource/services', () => ({
  prepareNamedResourcesMap: vi.fn().mockResolvedValue({}),
}));
vi.mock('@investment/services', () => ({
  prepareInvestmentOperationsMap: vi.fn().mockResolvedValue({}),
}));

import * as investmentServices from '@investment/services';

import * as namedResourceServices from '@named-resource/services';
import * as transactionDb from '@transaction/db';

import { listTransactions } from './list-transactions';

describe('listTransactions', () => {
  it('queries transactions, resolves maps and serializes results', async () => {
    const txStandard = {
      _id: { toString: () => 'tx-1' },
      kind: 'standard',
      accountId: { toString: () => 'acc-1' },
      categoryId: { toString: () => 'cat-1' },
      paymentMethodId: { toString: () => 'pm-1' },
    };
    const txInvestment = {
      _id: { toString: () => 'tx-2' },
      kind: 'investment',
      accountId: { toString: () => 'acc-2' },
      categoryId: { toString: () => 'cat-2' },
      paymentMethodId: { toString: () => 'pm-2' },
    };

    vi.mocked(transactionDb.findTransactions).mockResolvedValue([
      txStandard,
      txInvestment,
    ] as any);
    vi.mocked(transactionDb.findTransactionsCount).mockResolvedValue(15);

    const investmentMap = {
      'tx-2': {
        operationKind: 'buy' as const,
        instrument: {
          id: 'inst-1',
          name: 'Tesla',
          kind: 'share' as const,
          currency: 'USD',
        },
      },
    };
    vi.mocked(investmentServices.prepareInvestmentOperationsMap).mockResolvedValue(
      investmentMap as any,
    );

    const serialize = vi.fn().mockImplementation((tx, maps) => ({
      id: tx._id.toString(),
      kind: tx.kind,
      inv: maps?.investmentsMap?.[tx._id.toString()],
    }));

    const result = await listTransactions({
      filter: { ownerId: 'u1' as any },
      query: { page: 1, limit: 10, sortBy: 'date', sortOrder: 'desc' },
      userId: 'u1',
      serialize,
    });

    expect(transactionDb.findTransactions).toHaveBeenCalledWith(
      { ownerId: 'u1' },
      { page: 1, limit: 10, sortBy: 'date', sortOrder: 'desc' },
    );
    expect(transactionDb.findTransactionsCount).toHaveBeenCalledWith({ ownerId: 'u1' });
    expect(namedResourceServices.prepareNamedResourcesMap).toHaveBeenCalledTimes(3);
    expect(investmentServices.prepareInvestmentOperationsMap).toHaveBeenCalledWith('u1', [
      'tx-2',
    ]);

    expect(result).toEqual({
      page: 1,
      limit: 10,
      total: 15,
      totalPages: 2,
      items: [
        { id: 'tx-1', kind: 'standard', inv: undefined },
        { id: 'tx-2', kind: 'investment', inv: investmentMap['tx-2'] },
      ],
    });
  });
});
