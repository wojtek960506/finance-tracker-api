import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findNamedResourceById } from '@named-resource/db';
import { checkOwner } from '@shared/services';
import { TransactionModel } from '@transaction/model';
import {
  SportCategoryOwnershipError,
  SportEntryNotFoundError,
  TransactionNotFoundError,
} from '@utils/errors';

import { SportEntryModel } from '../../model';

import {
  createSportEntry,
  deleteSportEntry,
  getSportEntry,
  listSportEntries,
  updateSportEntry,
} from './index';

vi.mock('@named-resource/db', () => ({
  findNamedResourceById: vi.fn(),
}));

vi.mock('@shared/services', () => ({
  checkOwner: vi.fn(),
}));

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
      create: vi.fn(),
      find: vi.fn(),
      findById: vi.fn(),
      countDocuments: vi.fn(),
    },
  };
});

describe('Sport Entries Services', () => {
  const ownerId = new Types.ObjectId().toString();
  const categoryId = new Types.ObjectId().toString();
  const entryId = new Types.ObjectId().toString();
  const transactionId = new Types.ObjectId().toString();
  const now = new Date();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSportEntry', () => {
    it('creates and serializes a sport entry successfully', async () => {
      const categoryDoc = {
        _id: new Types.ObjectId(categoryId),
        name: 'Running',
        type: 'user' as const,
        ownerId: new Types.ObjectId(ownerId),
      };

      vi.mocked(findNamedResourceById).mockResolvedValue(categoryDoc as any);

      const createdDoc = {
        _id: new Types.ObjectId(entryId),
        ownerId: new Types.ObjectId(ownerId),
        categoryId: new Types.ObjectId(categoryId),
        date: now,
        itemName: 'Running Shoes',
        costPln: 350,
        description: null,
        transactionId: null,
        createdAt: now,
        updatedAt: now,
      };

      vi.mocked(SportEntryModel.create).mockResolvedValue(createdDoc as any);

      const result = await createSportEntry(ownerId, {
        categoryId,
        date: now,
        itemName: 'Running Shoes',
        costPln: 350,
      });

      expect(result.id).toBe(entryId);
      expect(result.category.name).toBe('Running');
      expect(result.costPln).toBe(350);
      expect(SportEntryModel.create).toHaveBeenCalled();
    });

    it('verifies transaction ownership when transactionId is provided', async () => {
      vi.mocked(findNamedResourceById).mockResolvedValue({
        _id: new Types.ObjectId(categoryId),
        name: 'Gym',
        type: 'system' as const,
      } as any);

      vi.mocked(TransactionModel.findOne).mockResolvedValue(null);

      await expect(
        createSportEntry(ownerId, {
          categoryId,
          date: now,
          itemName: 'Gym Pass',
          costPln: 150,
          transactionId,
        }),
      ).rejects.toThrow(TransactionNotFoundError);
    });

    it('throws error if category checkOwner fails', async () => {
      vi.mocked(findNamedResourceById).mockResolvedValue({
        _id: new Types.ObjectId(categoryId),
        name: 'Custom Cat',
        type: 'user' as const,
        ownerId: new Types.ObjectId(),
      } as any);

      vi.mocked(checkOwner).mockImplementationOnce(() => {
        throw new SportCategoryOwnershipError('wrong', categoryId, 'real');
      });

      await expect(
        createSportEntry(ownerId, {
          categoryId,
          date: now,
          itemName: 'Item',
          costPln: 100,
        }),
      ).rejects.toThrow(SportCategoryOwnershipError);
    });
  });

  describe('listSportEntries', () => {
    it('queries entries with sort, search, and pagination', async () => {
      const entryDoc = {
        _id: new Types.ObjectId(entryId),
        ownerId: new Types.ObjectId(ownerId),
        categoryId: {
          _id: new Types.ObjectId(categoryId),
          name: 'Cycling',
          type: 'user' as const,
        },
        date: now,
        itemName: 'Bicycle Lock',
        costPln: 120,
        description: null,
        transactionId: null,
        createdAt: now,
        updatedAt: now,
      };

      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValue([entryDoc]),
      };

      vi.mocked(SportEntryModel.find).mockReturnValue(mockQuery as any);
      vi.mocked(SportEntryModel.countDocuments).mockResolvedValue(1);

      const result = await listSportEntries(ownerId, {
        page: 1,
        limit: 10,
        sort: 'cost_desc',
        search: 'Bicycle',
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].itemName).toBe('Bicycle Lock');
      expect(result.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ costPln: -1, _id: -1 });
    });
  });

  describe('getSportEntry', () => {
    it('returns serialized entry when found and owned', async () => {
      const entryDoc = {
        _id: new Types.ObjectId(entryId),
        ownerId: new Types.ObjectId(ownerId),
        categoryId: {
          _id: new Types.ObjectId(categoryId),
          name: 'Swimming',
          type: 'user' as const,
        },
        date: now,
        itemName: 'Goggles',
        costPln: 80,
        description: null,
        transactionId: null,
        createdAt: now,
        updatedAt: now,
      };

      vi.mocked(SportEntryModel.findById).mockReturnValue({
        populate: vi.fn().mockResolvedValue(entryDoc),
      } as any);

      const result = await getSportEntry(ownerId, entryId);

      expect(result.id).toBe(entryId);
      expect(result.category.name).toBe('Swimming');
      expect(checkOwner).toHaveBeenCalledWith(
        ownerId,
        entryId,
        expect.anything(),
        'sportEntry',
      );
    });

    it('throws SportEntryNotFoundError if entry does not exist', async () => {
      vi.mocked(SportEntryModel.findById).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      } as any);

      await expect(getSportEntry(ownerId, entryId)).rejects.toThrow(
        SportEntryNotFoundError,
      );
    });
  });

  describe('updateSportEntry', () => {
    it('updates entry fields successfully', async () => {
      const entryDoc: any = {
        _id: new Types.ObjectId(entryId),
        ownerId: new Types.ObjectId(ownerId),
        categoryId: new Types.ObjectId(categoryId),
        date: now,
        itemName: 'Old Name',
        costPln: 50,
        description: null,
        transactionId: null,
        createdAt: now,
        updatedAt: now,
        save: vi.fn().mockResolvedValue(undefined),
        populate: vi.fn().mockImplementation(function (this: any) {
          this.categoryId = {
            _id: new Types.ObjectId(categoryId),
            name: 'Gym',
            type: 'system',
          };
          return Promise.resolve(this);
        }),
      };

      vi.mocked(SportEntryModel.findById).mockResolvedValue(entryDoc);

      const result = await updateSportEntry(ownerId, entryId, {
        itemName: 'New Name',
        costPln: 99,
      });

      expect(entryDoc.itemName).toBe('New Name');
      expect(entryDoc.costPln).toBe(99);
      expect(entryDoc.save).toHaveBeenCalled();
      expect(result.itemName).toBe('New Name');
    });

    it('throws SportEntryNotFoundError if entry to update does not exist', async () => {
      vi.mocked(SportEntryModel.findById).mockResolvedValue(null);

      await expect(
        updateSportEntry(ownerId, entryId, { itemName: 'New' }),
      ).rejects.toThrow(SportEntryNotFoundError);
    });
  });

  describe('deleteSportEntry', () => {
    it('deletes entry when found and owned', async () => {
      const entryDoc = {
        _id: new Types.ObjectId(entryId),
        ownerId: new Types.ObjectId(ownerId),
        deleteOne: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(SportEntryModel.findById).mockResolvedValue(entryDoc as any);

      await deleteSportEntry(ownerId, entryId);

      expect(checkOwner).toHaveBeenCalledWith(
        ownerId,
        entryId,
        expect.anything(),
        'sportEntry',
      );
      expect(entryDoc.deleteOne).toHaveBeenCalled();
    });

    it('throws SportEntryNotFoundError when entry to delete is missing', async () => {
      vi.mocked(SportEntryModel.findById).mockResolvedValue(null);

      await expect(deleteSportEntry(ownerId, entryId)).rejects.toThrow(
        SportEntryNotFoundError,
      );
    });
  });
});
