import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TransactionModel } from '@transaction/model';
import { SportEntryNotFoundError, TransactionNotFoundError } from '@utils/errors';

import { SportEntryModel } from '../../model';

import {
  linkSportSpendingsToTransaction,
  unlinkSportSpendingFromTransaction,
} from './index';

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../model', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../model')>();
  return {
    ...actual,
    SportEntryModel: {
      find: vi.fn(),
      findOne: vi.fn(),
      updateMany: vi.fn(),
    },
  };
});

describe('Sport Spending Link Services', () => {
  const ownerId = new Types.ObjectId().toString();
  const transactionId = new Types.ObjectId().toString();
  const entryId1 = new Types.ObjectId().toString();
  const entryId2 = new Types.ObjectId().toString();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('linkSportSpendingsToTransaction', () => {
    it('throws TransactionNotFoundError if transaction does not exist', async () => {
      vi.spyOn(TransactionModel, 'findOne').mockResolvedValue(null);

      await expect(
        linkSportSpendingsToTransaction(ownerId, {
          transactionId,
          entryIds: [entryId1],
        }),
      ).rejects.toThrow(TransactionNotFoundError);
    });

    it('throws SportEntryNotFoundError if any entry is missing', async () => {
      vi.spyOn(TransactionModel, 'findOne').mockResolvedValue({ _id: transactionId });
      vi.spyOn(SportEntryModel, 'find').mockResolvedValue([
        { _id: new Types.ObjectId(entryId1) },
      ] as any);

      await expect(
        linkSportSpendingsToTransaction(ownerId, {
          transactionId,
          entryIds: [entryId1, entryId2],
        }),
      ).rejects.toThrow(SportEntryNotFoundError);
    });

    it('updates all entries with transactionId on success', async () => {
      vi.spyOn(TransactionModel, 'findOne').mockResolvedValue({ _id: transactionId });
      vi.spyOn(SportEntryModel, 'find').mockResolvedValue([
        { _id: new Types.ObjectId(entryId1) },
        { _id: new Types.ObjectId(entryId2) },
      ] as any);
      vi.spyOn(SportEntryModel, 'updateMany').mockResolvedValue({
        acknowledged: true,
        modifiedCount: 2,
      } as any);

      const result = await linkSportSpendingsToTransaction(ownerId, {
        transactionId,
        entryIds: [entryId1, entryId2],
      });

      expect(SportEntryModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: [entryId1, entryId2] }, ownerId },
        { $set: { transactionId } },
      );
      expect(result).toEqual({ acknowledged: true, modifiedCount: 2 });
    });
  });

  describe('unlinkSportSpendingFromTransaction', () => {
    it('throws SportEntryNotFoundError if entry does not exist', async () => {
      vi.spyOn(SportEntryModel, 'findOne').mockResolvedValue(null);

      await expect(
        unlinkSportSpendingFromTransaction(ownerId, {
          entryId: entryId1,
        }),
      ).rejects.toThrow(SportEntryNotFoundError);
    });

    it('nullifies transactionId and saves on success', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      const mockDoc = {
        _id: new Types.ObjectId(entryId1),
        transactionId,
        save: mockSave,
      };

      vi.spyOn(SportEntryModel, 'findOne').mockResolvedValue(mockDoc as any);

      const result = await unlinkSportSpendingFromTransaction(ownerId, {
        entryId: entryId1,
      });

      expect(mockDoc.transactionId).toBeNull();
      expect(mockSave).toHaveBeenCalledOnce();
      expect(result).toEqual({ acknowledged: true, modifiedCount: 1 });
    });
  });
});
