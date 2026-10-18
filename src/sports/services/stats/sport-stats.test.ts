import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { prepareNamedResourcesMap } from '@named-resource/services';

import { SportEntryModel } from '../../model';

import { getSportStats } from './get-sport-stats';

vi.mock('@named-resource/services', () => ({
  prepareNamedResourcesMap: vi.fn(),
}));

vi.mock('../../model', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../model')>();
  return {
    ...actual,
    SportEntryModel: {
      aggregate: vi.fn(),
    },
  };
});

describe('getSportStats service', () => {
  const ownerId = new Types.ObjectId().toString();
  const cat1Id = new Types.ObjectId();
  const cat2Id = new Types.ObjectId();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns zeroed stats when user has no entries', async () => {
    vi.spyOn(SportEntryModel, 'aggregate').mockResolvedValueOnce([
      {
        overall: [],
        byCategory: [],
        byYear: [],
        byMonth: [],
      },
    ]);

    const result = await getSportStats(ownerId);

    expect(result).toEqual({
      totalCostPln: 0,
      totalEntries: 0,
      byCategory: [],
      byYear: [],
      byMonth: [],
    });
    expect(prepareNamedResourcesMap).not.toHaveBeenCalled();
  });

  it('correctly calculates totals, percentages, and resolves categories', async () => {
    vi.spyOn(SportEntryModel, 'aggregate').mockResolvedValueOnce([
      {
        overall: [{ _id: null, totalCostPln: 300, totalEntries: 4 }],
        byCategory: [
          { _id: cat1Id, totalCostPln: 200, entryCount: 2 },
          { _id: cat2Id, totalCostPln: 100, entryCount: 2 },
        ],
        byYear: [{ _id: 2024, totalCostPln: 300, entryCount: 4 }],
        byMonth: [
          { _id: { year: 2024, month: 5 }, totalCostPln: 120, entryCount: 2 },
          { _id: { year: 2024, month: 6 }, totalCostPln: 180, entryCount: 2 },
        ],
      },
    ]);

    vi.mocked(prepareNamedResourcesMap).mockResolvedValueOnce({
      [cat1Id.toString()]: {
        id: cat1Id.toString(),
        name: 'Running',
        type: 'user',
      },
      [cat2Id.toString()]: {
        id: cat2Id.toString(),
        name: 'Other',
        type: 'system',
      },
    });

    const result = await getSportStats(ownerId);

    expect(prepareNamedResourcesMap).toHaveBeenCalledWith('sportCategory', ownerId, [
      cat1Id.toString(),
      cat2Id.toString(),
    ]);

    expect(result.totalCostPln).toBe(300);
    expect(result.totalEntries).toBe(4);
    expect(result.byCategory).toEqual([
      {
        categoryId: cat1Id.toString(),
        categoryName: 'Running',
        categoryKey: null,
        type: 'user',
        totalCostPln: 200,
        entryCount: 2,
        percentage: 66.67,
      },
      {
        categoryId: cat2Id.toString(),
        categoryName: 'Other',
        categoryKey: 'other',
        type: 'system',
        totalCostPln: 100,
        entryCount: 2,
        percentage: 33.33,
      },
    ]);
    expect(result.byYear).toEqual([
      {
        year: 2024,
        totalCostPln: 300,
        entryCount: 4,
      },
    ]);
    expect(result.byMonth).toEqual([
      {
        year: 2024,
        month: 5,
        totalCostPln: 120,
        entryCount: 2,
      },
      {
        year: 2024,
        month: 6,
        totalCostPln: 180,
        entryCount: 2,
      },
    ]);
  });

  it('filters date range when year query parameter is passed', async () => {
    const aggregateSpy = vi.spyOn(SportEntryModel, 'aggregate').mockResolvedValueOnce([
      {
        overall: [{ _id: null, totalCostPln: 50, totalEntries: 1 }],
        byCategory: [{ _id: cat1Id, totalCostPln: 50, entryCount: 1 }],
        byYear: [{ _id: 2025, totalCostPln: 50, entryCount: 1 }],
        byMonth: [{ _id: { year: 2025, month: 3 }, totalCostPln: 50, entryCount: 1 }],
      },
    ]);

    vi.mocked(prepareNamedResourcesMap).mockResolvedValueOnce({
      [cat1Id.toString()]: {
        id: cat1Id.toString(),
        name: 'Cycling',
        type: 'user',
      },
    });

    const result = await getSportStats(ownerId, { year: 2025 });

    expect(aggregateSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        {
          $match: {
            ownerId: new Types.ObjectId(ownerId),
            date: {
              $gte: new Date(Date.UTC(2025, 0, 1, 0, 0, 0, 0)),
              $lt: new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 0)),
            },
          },
        },
      ]),
    );

    expect(result.totalCostPln).toBe(50);
    expect(result.totalEntries).toBe(1);
    expect(result.byYear).toEqual([
      {
        year: 2025,
        totalCostPln: 50,
        entryCount: 1,
      },
    ]);
  });

  it('handles unknown category gracefully and rounds amounts', async () => {
    const unknownCatId = new Types.ObjectId();
    vi.spyOn(SportEntryModel, 'aggregate').mockResolvedValueOnce([
      {
        overall: [{ _id: null, totalCostPln: 99.999, totalEntries: 1 }],
        byCategory: [{ _id: unknownCatId, totalCostPln: 99.999, entryCount: 1 }],
        byYear: [{ _id: 2024, totalCostPln: 99.999, entryCount: 1 }],
        byMonth: [{ _id: { year: 2024, month: 1 }, totalCostPln: 99.999, entryCount: 1 }],
      },
    ]);

    vi.mocked(prepareNamedResourcesMap).mockResolvedValueOnce({});

    const result = await getSportStats(ownerId);

    expect(result.totalCostPln).toBe(100);
    expect(result.byCategory[0]).toEqual({
      categoryId: unknownCatId.toString(),
      categoryName: 'Unknown',
      categoryKey: null,
      type: 'user',
      totalCostPln: 100,
      entryCount: 1,
      percentage: 100,
    });
  });
});
