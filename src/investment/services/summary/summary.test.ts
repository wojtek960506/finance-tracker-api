import { InvestmentInstrumentModel, InvestmentOperationModel } from '@investment/model';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { calculateInstrumentSummary } from './calculate-instrument-summary';
import { getInvestmentSummary } from './get-investment-summary';

vi.mock('@investment/model', () => ({
  InvestmentInstrumentModel: {
    find: vi.fn(),
  },
  InvestmentOperationModel: {
    find: vi.fn(),
  },
}));

describe('Investment Summary Services', () => {
  const ownerId = '507f1f77bcf86cd799439011';
  const instrumentId1 = '507f1f77bcf86cd799439012';
  const instrumentId2 = '507f1f77bcf86cd799439013';

  const mockInstrumentDoc1 = {
    _id: new Types.ObjectId(instrumentId1),
    ownerId: new Types.ObjectId(ownerId),
    name: 'Apple Inc.',
    kind: 'share' as const,
    currency: 'USD',
    notes: 'Tech stock',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockInstrumentDoc2 = {
    _id: new Types.ObjectId(instrumentId2),
    ownerId: new Types.ObjectId(ownerId),
    name: 'Lokata 3M PKO',
    kind: 'termDeposit' as const,
    currency: 'PLN',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  describe('calculateInstrumentSummary', () => {
    it('calculates summary when only buy operation exists (no snapshot)', () => {
      const operations = [
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc1._id,
          kind: 'buy' as const,
          amount: 5000,
          currency: 'USD',
          date: new Date('2026-01-15'),
          createdAt: new Date('2026-01-15'),
        },
      ];

      const result = calculateInstrumentSummary(
        mockInstrumentDoc1 as any,
        operations as any,
      );

      expect(result.currentValue).toBe(5000);
      expect(result.netInvested).toBe(5000);
      expect(result.totalBought).toBe(5000);
      expect(result.totalSold).toBe(0);
      expect(result.totalInterest).toBe(0);
      expect(result.totalFees).toBe(0);
      expect(result.pnl).toBe(0);
      expect(result.roiPercentage).toBe(0);
      expect(result.lastSnapshotDate).toBeNull();
      expect(result.operationsCount).toBe(1);
    });

    it('calculates summary using latest snapshot when snapshot exists', () => {
      const snapshotDate = new Date('2026-09-01');
      const operations = [
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc1._id,
          kind: 'buy' as const,
          amount: 5000,
          currency: 'USD',
          date: new Date('2026-01-15'),
          createdAt: new Date('2026-01-15'),
        },
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc1._id,
          kind: 'snapshot' as const,
          amount: 6500,
          currency: 'USD',
          date: snapshotDate,
          createdAt: snapshotDate,
        },
      ];

      const result = calculateInstrumentSummary(
        mockInstrumentDoc1 as any,
        operations as any,
      );

      expect(result.currentValue).toBe(6500);
      expect(result.netInvested).toBe(5000);
      expect(result.pnl).toBe(1500);
      expect(result.roiPercentage).toBe(30);
      expect(result.lastSnapshotDate).toEqual(snapshotDate);
      expect(result.operationsCount).toBe(2);
    });

    it('calculates summary for savings account with interest (no snapshot)', () => {
      const operations = [
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc2._id,
          kind: 'buy' as const,
          amount: 64164.11,
          currency: 'PLN',
          date: new Date('2026-01-01'),
          createdAt: new Date('2026-01-01'),
        },
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc2._id,
          kind: 'sell' as const,
          amount: 2664.11,
          currency: 'PLN',
          date: new Date('2026-02-01'),
          createdAt: new Date('2026-02-01'),
        },
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc2._id,
          kind: 'interest' as const,
          amount: 173.42,
          currency: 'PLN',
          date: new Date('2026-03-01'),
          createdAt: new Date('2026-03-01'),
        },
      ];

      const result = calculateInstrumentSummary(
        mockInstrumentDoc2 as any,
        operations as any,
      );

      // currentValue = 64164.11 - 2664.11 + 173.42 = 61673.42
      expect(result.currentValue).toBe(61673.42);
      // netInvested = 64164.11 - 2664.11 = 61500.00
      expect(result.netInvested).toBe(61500);
      expect(result.totalBought).toBe(64164.11);
      expect(result.totalSold).toBe(2664.11);
      expect(result.totalInterest).toBe(173.42);
      expect(result.totalFees).toBe(0);
      // pnl = 61673.42 + 2664.11 - 64164.11 = 173.42
      expect(result.pnl).toBe(173.42);
      expect(result.roiPercentage).toBe(0.27);
      expect(result.lastSnapshotDate).toBeNull();
      expect(result.operationsCount).toBe(3);
    });

    it('calculates summary for fully closed/liquidated position with realized profit', () => {
      const operations = [
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc2._id,
          kind: 'buy' as const,
          amount: 10000,
          currency: 'PLN',
          date: new Date('2026-01-01'),
          createdAt: new Date('2026-01-01'),
        },
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc2._id,
          kind: 'interest' as const,
          amount: 500,
          currency: 'PLN',
          date: new Date('2026-02-01'),
          createdAt: new Date('2026-02-01'),
        },
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc2._id,
          kind: 'sell' as const,
          amount: 10500,
          currency: 'PLN',
          date: new Date('2026-03-01'),
          createdAt: new Date('2026-03-01'),
        },
      ];

      const result = calculateInstrumentSummary(
        mockInstrumentDoc2 as any,
        operations as any,
      );

      // currentValue = 0 (closed)
      expect(result.currentValue).toBe(0);
      // netInvested = 0 (no active capital remaining)
      expect(result.netInvested).toBe(0);
      // pnl = 0 + 10500 - 10000 = +500 realized profit
      expect(result.pnl).toBe(500);
      expect(result.roiPercentage).toBe(5);
    });
  });

  describe('getInvestmentSummary', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns empty summary when user has no instruments', async () => {
      const instSortMock = vi.fn().mockResolvedValue([]);
      vi.mocked(InvestmentInstrumentModel.find).mockReturnValue({
        sort: instSortMock,
      } as any);

      const opSortMock = vi.fn().mockResolvedValue([]);
      vi.mocked(InvestmentOperationModel.find).mockReturnValue({
        sort: opSortMock,
      } as any);

      const result = await getInvestmentSummary(ownerId);

      expect(result.instruments).toHaveLength(0);
      expect(result.totalsByCurrency).toEqual({});
    });

    it('aggregates portfolio totals across multiple currencies', async () => {
      const instSortMock = vi
        .fn()
        .mockResolvedValue([mockInstrumentDoc1, mockInstrumentDoc2]);
      vi.mocked(InvestmentInstrumentModel.find).mockReturnValue({
        sort: instSortMock,
      } as any);

      const opSortMock = vi.fn().mockResolvedValue([
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc1._id,
          kind: 'buy',
          amount: 5000,
          currency: 'USD',
          date: new Date('2026-01-15'),
          createdAt: new Date('2026-01-15'),
        },
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc1._id,
          kind: 'snapshot',
          amount: 6000,
          currency: 'USD',
          date: new Date('2026-06-01'),
          createdAt: new Date('2026-06-01'),
        },
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc2._id,
          kind: 'buy',
          amount: 10000,
          currency: 'PLN',
          date: new Date('2026-02-01'),
          createdAt: new Date('2026-02-01'),
        },
        {
          _id: new Types.ObjectId(),
          instrumentId: mockInstrumentDoc2._id,
          kind: 'interest',
          amount: 300,
          currency: 'PLN',
          date: new Date('2026-05-01'),
          createdAt: new Date('2026-05-01'),
        },
      ]);
      vi.mocked(InvestmentOperationModel.find).mockReturnValue({
        sort: opSortMock,
      } as any);

      const result = await getInvestmentSummary(ownerId);

      expect(result.instruments).toHaveLength(2);

      // USD totals
      expect(result.totalsByCurrency.USD).toBeDefined();
      expect(result.totalsByCurrency.USD.totalCurrentValue).toBe(6000);
      expect(result.totalsByCurrency.USD.totalNetInvested).toBe(5000);
      expect(result.totalsByCurrency.USD.totalPnL).toBe(1000);
      expect(result.totalsByCurrency.USD.roiPercentage).toBe(20);
      expect(result.totalsByCurrency.USD.instrumentsCount).toBe(1);

      // PLN totals
      expect(result.totalsByCurrency.PLN).toBeDefined();
      expect(result.totalsByCurrency.PLN.totalCurrentValue).toBe(10300);
      expect(result.totalsByCurrency.PLN.totalNetInvested).toBe(10000);
      expect(result.totalsByCurrency.PLN.totalPnL).toBe(300);
      expect(result.totalsByCurrency.PLN.roiPercentage).toBe(3);
      expect(result.totalsByCurrency.PLN.instrumentsCount).toBe(1);
    });
  });
});
