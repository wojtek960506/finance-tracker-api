import { InvestmentInstrumentModel, InvestmentOperationModel } from '@investment/model';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  InvestmentInstrumentAlreadyExistsError,
  InvestmentInstrumentDependencyError,
  InvestmentInstrumentNotFoundError,
} from '@utils/errors';

import * as findInstrumentByIdModule from './find-instrument-by-id';
import * as findOrCreateInstrumentModule from './find-or-create-instrument';
import { findOrCreateInstrument } from './find-or-create-instrument';
import {
  createInstrument,
  deleteInstrument,
  findInstrumentById,
  getInstrumentById,
  getInstruments,
  updateInstrument,
} from './index';
import { resolveInstrumentId } from './resolve-instrument-id';

vi.mock('@investment/model', () => ({
  InvestmentInstrumentModel: {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn(),
  },
  InvestmentOperationModel: {
    find: vi.fn(),
    countDocuments: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

describe('Investment Instruments Services', () => {
  const ownerId = '507f1f77bcf86cd799439011';
  const instrumentId = '507f1f77bcf86cd799439012';
  const newInstrumentId = '507f1f77bcf86cd799439099';

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
    it('returns instrument with calculated summary when found', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(
        mockInstrumentDoc as any,
      );
      vi.mocked(InvestmentOperationModel.find).mockReturnValue({
        sort: vi.fn().mockResolvedValue([
          {
            _id: new Types.ObjectId(),
            instrumentId: mockInstrumentDoc._id,
            kind: 'buy',
            amount: 5000,
            currency: 'USD',
            date: new Date(),
            createdAt: new Date(),
          },
        ]),
      } as any);

      const result = await getInstrumentById(ownerId, instrumentId);

      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith({
        _id: instrumentId,
        ownerId,
      });
      expect(result.id).toBe(instrumentId);
      expect(result.currentValue).toBe(5000);
      expect(result.netInvested).toBe(5000);
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

  describe('findOrCreateInstrument', () => {
    it('returns existing instrument id if matching normalized name is found', async () => {
      const mockExisting = {
        _id: new Types.ObjectId(instrumentId),
        ownerId: new Types.ObjectId(ownerId),
        name: 'Apple Inc.',
        nameNormalized: 'apple inc.',
      };

      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(mockExisting as any);

      const result = await findOrCreateInstrument(
        ownerId,
        {
          name: '  Apple Inc.  ',
          kind: 'share',
        },
        'USD',
      );

      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith({
        ownerId,
        nameNormalized: 'apple inc.',
      });
      expect(InvestmentInstrumentModel.create).not.toHaveBeenCalled();
      expect(result).toBe(instrumentId);
    });

    it('creates and returns new instrument if none exists', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);

      const mockCreated = {
        _id: new Types.ObjectId(newInstrumentId),
        name: 'Tesla Motors',
        nameNormalized: 'tesla motors',
        kind: 'share',
        currency: 'USD',
      };
      vi.mocked(InvestmentInstrumentModel.create).mockResolvedValue([mockCreated] as any);

      const result = await findOrCreateInstrument(
        ownerId,
        {
          name: '  Tesla Motors ',
          kind: 'share',
          notes: 'EV manufacturer',
        },
        'USD',
      );

      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith({
        ownerId,
        nameNormalized: 'tesla motors',
      });
      expect(InvestmentInstrumentModel.create).toHaveBeenCalledWith(
        [
          {
            ownerId,
            name: 'Tesla Motors',
            nameNormalized: 'tesla motors',
            kind: 'share',
            currency: 'USD',
            notes: 'EV manufacturer',
          },
        ],
        {},
      );
      expect(result).toBe(newInstrumentId);
    });

    it('uses explicit currency when provided in newInstrument', async () => {
      vi.mocked(InvestmentInstrumentModel.findOne).mockResolvedValue(null);

      const mockCreated = {
        _id: new Types.ObjectId(newInstrumentId),
        name: 'VWRL ETF',
        nameNormalized: 'vwrl etf',
        kind: 'fund',
        currency: 'EUR',
      };
      vi.mocked(InvestmentInstrumentModel.create).mockResolvedValue([mockCreated] as any);

      const mockSession = {} as any;
      const result = await findOrCreateInstrument(
        ownerId,
        {
          name: 'VWRL ETF',
          kind: 'fund',
          currency: 'EUR',
        },
        'USD',
        mockSession,
      );

      expect(InvestmentInstrumentModel.findOne).toHaveBeenCalledWith(
        {
          ownerId,
          nameNormalized: 'vwrl etf',
        },
        null,
        { session: mockSession },
      );
      expect(InvestmentInstrumentModel.create).toHaveBeenCalledWith(
        [
          {
            ownerId,
            name: 'VWRL ETF',
            nameNormalized: 'vwrl etf',
            kind: 'fund',
            currency: 'EUR',
            notes: undefined,
          },
        ],
        { session: mockSession },
      );
      expect(result).toBe(newInstrumentId);
    });
  });

  describe('resolveInstrumentId', () => {
    it('delegates to findInstrumentById when instrumentId is provided', async () => {
      const mockInstrument = {
        _id: { toString: () => instrumentId },
      };
      vi.spyOn(findInstrumentByIdModule, 'findInstrumentById').mockResolvedValue(
        mockInstrument as any,
      );

      const session = {} as any;
      const result = await resolveInstrumentId(
        ownerId,
        {
          instrumentId,
          operationKind: 'buy',
        },
        'USD',
        session,
      );

      expect(findInstrumentByIdModule.findInstrumentById).toHaveBeenCalledWith(
        ownerId,
        instrumentId,
        session,
      );
      expect(result).toBe(instrumentId);
    });

    it('delegates to findOrCreateInstrument when newInstrument is provided', async () => {
      const newInstrument = {
        name: 'Tesla Inc.',
        kind: 'share' as const,
        currency: 'USD' as const,
      };
      vi.spyOn(findOrCreateInstrumentModule, 'findOrCreateInstrument').mockResolvedValue(
        instrumentId,
      );

      const session = {} as any;
      const result = await resolveInstrumentId(
        ownerId,
        {
          newInstrument,
          operationKind: 'buy',
        },
        'USD',
        session,
      );

      expect(findOrCreateInstrumentModule.findOrCreateInstrument).toHaveBeenCalledWith(
        ownerId,
        newInstrument,
        'USD',
        session,
      );
      expect(result).toBe(instrumentId);
    });
  });
});
