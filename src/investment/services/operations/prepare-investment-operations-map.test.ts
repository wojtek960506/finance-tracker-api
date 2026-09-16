import { describe, expect, it, vi } from 'vitest';

vi.mock('@investment/model', () => ({
  InvestmentOperationModel: {
    find: vi.fn(),
  },
}));

import { InvestmentOperationModel } from '@investment/model';

import { prepareInvestmentOperationsMap } from './prepare-investment-operations-map';

describe('prepareInvestmentOperationsMap', () => {
  it('returns empty object when transactionIds is empty', async () => {
    const result = await prepareInvestmentOperationsMap('user-1', []);
    expect(result).toEqual({});
    expect(InvestmentOperationModel.find).not.toHaveBeenCalled();
  });

  it('queries operations and builds map keyed by transactionId', async () => {
    const mockPopulate = vi.fn().mockResolvedValue([
      {
        transactionId: { toString: () => 'tx-1' },
        kind: 'buy',
        note: 'Buying Apple shares',
        instrumentId: {
          _id: { toString: () => 'inst-1' },
          name: 'Apple Inc.',
          kind: 'share',
          currency: 'USD',
        },
      },
      {
        transactionId: { toString: () => 'tx-2' },
        kind: 'interest',
        note: undefined,
        instrumentId: {
          _id: { toString: () => 'inst-2' },
          name: 'Savings Plan',
          kind: 'savings',
          currency: 'EUR',
        },
      },
    ]);

    vi.mocked(InvestmentOperationModel.find).mockReturnValue({
      populate: mockPopulate,
    } as any);

    const result = await prepareInvestmentOperationsMap('user-1', ['tx-1', 'tx-2']);

    expect(InvestmentOperationModel.find).toHaveBeenCalledWith({
      ownerId: 'user-1',
      transactionId: { $in: ['tx-1', 'tx-2'] },
    });
    expect(mockPopulate).toHaveBeenCalledWith('instrumentId');

    expect(result).toEqual({
      'tx-1': {
        operationKind: 'buy',
        instrument: {
          id: 'inst-1',
          name: 'Apple Inc.',
          kind: 'share',
          currency: 'USD',
        },
        note: 'Buying Apple shares',
      },
      'tx-2': {
        operationKind: 'interest',
        instrument: {
          id: 'inst-2',
          name: 'Savings Plan',
          kind: 'savings',
          currency: 'EUR',
        },
      },
    });
  });
});
