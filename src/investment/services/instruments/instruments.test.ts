import { InvestmentInstrumentModel, InvestmentOperationModel } from '@investment/model';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  InvestmentInstrumentAlreadyExistsError,
  InvestmentInstrumentDependencyError,
  InvestmentInstrumentNotFoundError,
} from '@utils/errors';

import {
  createInstrument,
  deleteInstrument,
  findInstrumentById,
  getInstrumentById,
  getInstruments,
  updateInstrument,
} from './index';

vi.mock('@investment/model', () => ({
  InvestmentInstrumentModel: {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn(),
  },
  InvestmentOperationModel: {
    countDocuments: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

describe('Investment Instruments Services', () => {
  const ownerId = '507f1f77bcf86cd799439011';
  const instrumentId = '507f1f77bcf86cd799439012';

  const mockInstrumentDoc = {
    _id: new Types.ObjectId(instrumentId),
    ownerId: new Types.ObjectId(ownerId),
    name: 'S&P 500 ETF',
    nameNormalized: 's&p 500 etf',
    kind: 'fund' as const,
    currency: 'USD',
    notes: 'Long term index fund',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createInstrument', () => {
    it('creates an instrument when name is unique', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);
      vi.mocked(InvestmentInstrumentModel.create).mockResolvedValue(
        mockInstrumentDoc as any,
      );

      const result = await createInstrument(ownerId, {
        name: 'S&P 500 ETF',
        kind: 'fund',
        currency: 'USD',
        notes: 'Long term index fund',
      });

      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith({
        ownerId,
        nameNormalized: 's&p 500 etf',
      });
      expect(InvestmentInstrumentModel.create).toHaveBeenCalledWith({
        ownerId,
        name: 'S&P 500 ETF',
        nameNormalized: 's&p 500 etf',
        kind: 'fund',
        currency: 'USD',
        notes: 'Long term index fund',
      });
      expect(result.id).toBe(instrumentId);
      expect(result.name).toBe('S&P 500 ETF');
    });

    it('throws AlreadyExistsError if instrument with same name already exists', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(
        mockInstrumentDoc as any,
      );

      await expect(
        createInstrument(ownerId, {
          name: 'S&P 500 ETF',
          kind: 'fund',
          currency: 'USD',
        }),
      ).rejects.toThrow(InvestmentInstrumentAlreadyExistsError);
    });
  });

  describe('getInstruments', () => {
    it('returns all instruments for user', async () => {
      vi.mocked(InvestmentInstrumentModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([mockInstrumentDoc]),
      } as any);

      const result = await getInstruments(ownerId);

      expect(InvestmentInstrumentModel.find).toHaveBeenCalledWith({ ownerId });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('S&P 500 ETF');
    });

    it('filters by kind', async () => {
      vi.mocked(InvestmentInstrumentModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([mockInstrumentDoc]),
      } as any);

      await getInstruments(ownerId, { kind: 'fund' });

      expect(InvestmentInstrumentModel.find).toHaveBeenCalledWith({
        ownerId,
        kind: 'fund',
      });
    });
  });

  describe('findInstrumentById', () => {
    it('returns raw instrument document when found', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(
        mockInstrumentDoc as any,
      );

      const result = await findInstrumentById(ownerId, instrumentId);

      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith({
        _id: instrumentId,
        ownerId,
      });
      expect(result).toBe(mockInstrumentDoc);
    });

    it('throws NotFoundError when not found', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);

      await expect(findInstrumentById(ownerId, instrumentId)).rejects.toThrow(
        InvestmentInstrumentNotFoundError,
      );
    });
  });

  describe('getInstrumentById', () => {
    it('returns instrument when found', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(
        mockInstrumentDoc as any,
      );

      const result = await getInstrumentById(ownerId, instrumentId);

      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith({
        _id: instrumentId,
        ownerId,
      });
      expect(result.id).toBe(instrumentId);
    });

    it('throws NotFoundError when not found', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);

      await expect(getInstrumentById(ownerId, instrumentId)).rejects.toThrow(
        InvestmentInstrumentNotFoundError,
      );
    });
  });

  describe('updateInstrument', () => {
    it('updates instrument fields successfully', async () => {
      const doc = {
        ...mockInstrumentDoc,
        name: 'Old Name',
        nameNormalized: 'old name',
        save: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(InvestmentInstrumentModel.findOne)
        .mockResolvedValueOnce(doc as any)
        .mockResolvedValueOnce(null);

      const result = await updateInstrument(ownerId, instrumentId, {
        name: 'New Name',
        kind: 'share',
        notes: 'Updated notes',
      });

      expect(doc.name).toBe('New Name');
      expect(doc.nameNormalized).toBe('new name');
      expect(doc.kind).toBe('share');
      expect(doc.notes).toBe('Updated notes');
      expect(doc.save).toHaveBeenCalled();
      expect(result.name).toBe('New Name');
    });

    it('throws NotFoundError if instrument does not exist', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);

      await expect(
        updateInstrument(ownerId, instrumentId, { name: 'New Name' }),
      ).rejects.toThrow(InvestmentInstrumentNotFoundError);
    });
  });

  describe('deleteInstrument', () => {
    it('throws NotFoundError if instrument does not exist', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);

      await expect(deleteInstrument(ownerId, instrumentId)).rejects.toThrow(
        InvestmentInstrumentNotFoundError,
      );
    });

    it('throws InvestmentInstrumentDependencyError if instrument has operations', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(
        mockInstrumentDoc as any,
      );
      vi.mocked(InvestmentOperationModel.countDocuments).mockResolvedValue(3);

      await expect(deleteInstrument(ownerId, instrumentId)).rejects.toThrow(
        InvestmentInstrumentDependencyError,
      );

      expect(InvestmentInstrumentModel.deleteOne).not.toHaveBeenCalled();
    });

    it('deletes instrument when no operations exist', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(
        mockInstrumentDoc as any,
      );
      vi.mocked(InvestmentOperationModel.countDocuments).mockResolvedValue(0);

      const result = await deleteInstrument(ownerId, instrumentId);

      expect(InvestmentInstrumentModel.deleteOne).toHaveBeenCalledWith({
        _id: instrumentId,
        ownerId,
      });
      expect(result).toEqual({ id: instrumentId });
    });
  });
});
