import { InvestmentInstrumentModel, InvestmentOperationModel } from '@investment/model';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TransactionModel } from '@transaction/model';
import {
  CannotEditLinkedTransactionOperationError,
  InvestmentInstrumentNotFoundError,
  InvestmentOperationNotFoundError,
  OperationKindNotAllowedForInstrumentError,
  SnapshotNotAllowedForInstrumentError,
} from '@utils/errors';

import {
  createOperation,
  deleteOperation,
  getOperations,
  updateOperation,
} from './index';

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    find: vi.fn(),
  },
}));

vi.mock('@investment/model', () => ({
  InvestmentInstrumentModel: {
    findOne: vi.fn(),
  },
  InvestmentOperationModel: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

describe('Investment Operations Services', () => {
  const ownerId = '507f1f77bcf86cd799439011';
  const instrumentId = '507f1f77bcf86cd799439012';
  const newInstrumentId = '507f1f77bcf86cd799439015';
  const operationId = '507f1f77bcf86cd799439013';

  const mockInstrumentDoc = {
    _id: new Types.ObjectId(instrumentId),
    ownerId: new Types.ObjectId(ownerId),
    name: 'AAPL Shares',
    kind: 'share',
    currency: 'USD',
  };

  const mockSavingsInstrumentDoc = {
    _id: new Types.ObjectId(instrumentId),
    ownerId: new Types.ObjectId(ownerId),
    name: 'High Yield Savings',
    kind: 'savings',
    currency: 'USD',
  };

  const mockSnapshotDoc = {
    _id: new Types.ObjectId(operationId),
    ownerId: new Types.ObjectId(ownerId),
    instrumentId: new Types.ObjectId(instrumentId),
    transactionId: null,
    kind: 'snapshot' as const,
    amount: 1500,
    currency: 'USD',
    date: new Date('2026-09-01'),
    note: 'September valuation',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
  };

  const mockInterestDoc = {
    _id: new Types.ObjectId(operationId),
    ownerId: new Types.ObjectId(ownerId),
    instrumentId: new Types.ObjectId(instrumentId),
    transactionId: null,
    kind: 'interest' as const,
    amount: 50,
    currency: 'USD',
    date: new Date('2026-09-01'),
    note: 'Monthly interest',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
  };

  const mockCashFlowDoc = {
    _id: new Types.ObjectId(operationId),
    ownerId: new Types.ObjectId(ownerId),
    instrumentId: new Types.ObjectId(instrumentId),
    transactionId: new Types.ObjectId('507f1f77bcf86cd799439014'),
    kind: 'buy' as const,
    amount: 2000,
    currency: 'USD',
    date: new Date('2026-09-01'),
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TransactionModel.find).mockResolvedValue([] as any);
  });

  describe('createOperation', () => {
    it('creates a snapshot operation when instrument exists and is share or fund', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(
        mockInstrumentDoc as any,
      );
      vi.mocked(InvestmentOperationModel.create).mockResolvedValue(
        mockSnapshotDoc as any,
      );

      const result = await createOperation(ownerId, {
        instrumentId,
        kind: 'snapshot',
        amount: 1500,
        currency: 'USD',
        date: new Date('2026-09-01'),
        note: 'September valuation',
      });

      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith({
        _id: instrumentId,
        ownerId,
      });
      expect(InvestmentOperationModel.create).toHaveBeenCalledWith({
        ownerId,
        instrumentId,
        transactionId: null,
        kind: 'snapshot',
        amount: 1500,
        currency: 'USD',
        date: new Date('2026-09-01'),
        note: 'September valuation',
      });
      expect(result.id).toBe(operationId);
      expect(result.kind).toBe('snapshot');
      expect('transactionId' in result).toBe(false);
    });

    it('creates an interest operation for savings/termDeposit instrument', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(
        mockSavingsInstrumentDoc as any,
      );
      vi.mocked(InvestmentOperationModel.create).mockResolvedValue(
        mockInterestDoc as any,
      );

      const result = await createOperation(ownerId, {
        instrumentId,
        kind: 'interest',
        amount: 50,
        currency: 'USD',
        date: new Date('2026-09-01'),
        note: 'Monthly interest',
      });

      expect(InvestmentOperationModel.create).toHaveBeenCalledWith({
        ownerId,
        instrumentId,
        transactionId: null,
        kind: 'interest',
        amount: 50,
        currency: 'USD',
        date: new Date('2026-09-01'),
        note: 'Monthly interest',
      });
      expect(result.id).toBe(operationId);
      expect(result.kind).toBe('interest');
    });

    it(
      'throws SnapshotNotAllowedForInstrumentError ' +
        'when creating snapshot for termDeposit or savings',
      async () => {
        vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(
          mockSavingsInstrumentDoc as any,
        );

        await expect(
          createOperation(ownerId, {
            instrumentId,
            kind: 'snapshot',
            amount: 1500,
            currency: 'USD',
            date: new Date('2026-09-01'),
          }),
        ).rejects.toThrow(SnapshotNotAllowedForInstrumentError);
      },
    );

    it(
      'throws OperationKindNotAllowedForInstrumentError ' +
        'when creating interest/fee for share or fund',
      async () => {
        vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(
          mockInstrumentDoc as any,
        );

        await expect(
          createOperation(ownerId, {
            instrumentId,
            kind: 'interest',
            amount: 50,
            currency: 'USD',
            date: new Date('2026-09-01'),
          }),
        ).rejects.toThrow(OperationKindNotAllowedForInstrumentError);
      },
    );

    it('throws InvestmentInstrumentNotFoundError if instrument not found', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);

      await expect(
        createOperation(ownerId, {
          instrumentId,
          kind: 'snapshot',
          amount: 1500,
          currency: 'USD',
          date: new Date('2026-09-01'),
        }),
      ).rejects.toThrow(InvestmentInstrumentNotFoundError);
    });
  });

  describe('getOperations', () => {
    it('returns filtered active operations with deletion: null', async () => {
      const sortMock = vi.fn().mockResolvedValue([mockSnapshotDoc]);
      vi.mocked(InvestmentOperationModel.find).mockReturnValue({
        sort: sortMock,
      } as any);

      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-12-31');

      const result = await getOperations(ownerId, {
        instrumentId,
        kind: 'snapshot',
        startDate,
        endDate,
      });

      expect(InvestmentOperationModel.find).toHaveBeenCalledWith({
        ownerId,
        deletion: null,
        instrumentId,
        kind: 'snapshot',
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(operationId);
    });
  });

  describe('updateOperation', () => {
    it('updates operation when valid dto provided', async () => {
      const opDoc = {
        ...mockSnapshotDoc,
        save: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(InvestmentOperationModel.findOne).mockResolvedValue(opDoc as any);
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue({
        ...mockInstrumentDoc,
        _id: new Types.ObjectId(newInstrumentId),
      } as any);

      const newDate = new Date('2026-09-17');
      const result = await updateOperation(ownerId, operationId, {
        instrumentId: newInstrumentId,
        amount: 14500.5,
        currency: 'USD',
        date: newDate,
        notes: 'Updated revaluation',
      });

      expect(InvestmentOperationModel.findOne).toHaveBeenCalledWith({
        _id: operationId,
        ownerId,
        deletion: null,
      });
      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith({
        _id: newInstrumentId,
        ownerId,
      });
      expect(opDoc.amount).toBe(14500.5);
      expect(opDoc.currency).toBe('USD');
      expect(opDoc.date).toBe(newDate);
      expect(opDoc.note).toBe('Updated revaluation');
      expect(opDoc.instrumentId.toString()).toBe(newInstrumentId);
      expect(opDoc.save).toHaveBeenCalled();
      expect(result.id).toBe(operationId);
      expect(result.amount).toBe(14500.5);
    });

    it('updates note if note field is provided', async () => {
      const opDoc = {
        ...mockSnapshotDoc,
        save: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(InvestmentOperationModel.findOne).mockResolvedValue(opDoc as any);

      await updateOperation(ownerId, operationId, {
        note: 'Note field value',
      });

      expect(opDoc.note).toBe('Note field value');
      expect(opDoc.save).toHaveBeenCalled();
    });

    it('throws InvestmentOperationNotFoundError when operation is not found', async () => {
      vi.mocked(InvestmentOperationModel.findOne).mockResolvedValue(null);

      await expect(
        updateOperation(ownerId, operationId, { amount: 100 }),
      ).rejects.toThrow(InvestmentOperationNotFoundError);
    });

    it(
      'throws CannotEditLinkedTransactionOperationError ' +
        'when updating linked transaction operation',
      async () => {
        vi.mocked(InvestmentOperationModel.findOne).mockResolvedValue({
          ...mockCashFlowDoc,
          kind: 'buy',
        } as any);

        await expect(
          updateOperation(ownerId, operationId, { amount: 100 }),
        ).rejects.toThrow(CannotEditLinkedTransactionOperationError);
      },
    );

    it(
      'throws InvestmentInstrumentNotFoundError ' +
        'when target instrumentId is not found',
      async () => {
        const opDoc = {
          ...mockSnapshotDoc,
          save: vi.fn().mockResolvedValue(undefined),
        };
        vi.mocked(InvestmentOperationModel.findOne).mockResolvedValue(opDoc as any);
        vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);

        await expect(
          updateOperation(ownerId, operationId, {
            instrumentId: '507f1f77bcf86cd799439099',
          }),
        ).rejects.toThrow(InvestmentInstrumentNotFoundError);
      },
    );

    it(
      'throws SnapshotNotAllowedForInstrumentError ' +
        'when updating snapshot target to savings/termDeposit',
      async () => {
        const opDoc = {
          ...mockSnapshotDoc,
          kind: 'snapshot',
          save: vi.fn().mockResolvedValue(undefined),
        };
        vi.mocked(InvestmentOperationModel.findOne).mockResolvedValue(opDoc as any);
        vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(
          mockSavingsInstrumentDoc as any,
        );

        await expect(
          updateOperation(ownerId, operationId, {
            instrumentId: '507f1f77bcf86cd799439099',
          }),
        ).rejects.toThrow(SnapshotNotAllowedForInstrumentError);
      },
    );
  });

  describe('deleteOperation', () => {
    it('deletes operation when it exists and is standalone operation', async () => {
      vi.mocked(InvestmentOperationModel.findOne).mockResolvedValue(
        mockSnapshotDoc as any,
      );
      vi.mocked(InvestmentOperationModel.deleteOne).mockResolvedValue({
        deletedCount: 1,
      } as any);

      const result = await deleteOperation(ownerId, operationId);

      expect(InvestmentOperationModel.findOne).toHaveBeenCalledWith({
        _id: operationId,
        ownerId,
      });
      expect(InvestmentOperationModel.deleteOne).toHaveBeenCalledWith({
        _id: operationId,
        ownerId,
      });
      expect(result).toEqual({ id: operationId });
    });

    it('throws InvestmentOperationNotFoundError when not found', async () => {
      vi.mocked(InvestmentOperationModel.findOne).mockResolvedValue(null);

      await expect(deleteOperation(ownerId, operationId)).rejects.toThrow(
        InvestmentOperationNotFoundError,
      );
    });

    it(
      'throws CannotEditLinkedTransactionOperationError ' +
        'when deleting linked transaction operation',
      async () => {
        vi.mocked(InvestmentOperationModel.findOne).mockResolvedValue({
          ...mockCashFlowDoc,
          transactionId: new Types.ObjectId('507f1f77bcf86cd799439014'),
        } as any);

        await expect(deleteOperation(ownerId, operationId)).rejects.toThrow(
          CannotEditLinkedTransactionOperationError,
        );
      },
    );
  });
});
