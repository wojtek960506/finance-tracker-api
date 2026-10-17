import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { ISportEntry } from '../model';

import { serializeSportEntry } from './serialize-sport-entry';

describe('serializeSportEntry', () => {
  const entryId = new Types.ObjectId();
  const ownerId = new Types.ObjectId();
  const categoryId = new Types.ObjectId();
  const transactionId = new Types.ObjectId();
  const date = new Date('2026-05-08T00:00:00.000Z');
  const createdAt = new Date('2026-05-08T10:00:00.000Z');
  const updatedAt = new Date('2026-05-08T10:00:00.000Z');

  it('serializes sport entry with explicitly provided category DTO', () => {
    const entry = {
      _id: entryId,
      ownerId,
      categoryId,
      date,
      itemName: 'Running Shoes ASICS Dynablast',
      costPln: 389.99,
      description: 'Bought at discount',
      transactionId,
      createdAt,
      updatedAt,
    } as unknown as ISportEntry;

    const category = {
      id: categoryId.toString(),
      name: 'Running',
      type: 'user' as const,
    };

    const result = serializeSportEntry(entry, category);

    expect(result).toEqual({
      id: entryId.toString(),
      ownerId: ownerId.toString(),
      categoryId: categoryId.toString(),
      category: {
        id: categoryId.toString(),
        name: 'Running',
        type: 'user',
      },
      date,
      itemName: 'Running Shoes ASICS Dynablast',
      costPln: 389.99,
      description: 'Bought at discount',
      transactionId: transactionId.toString(),
      createdAt,
      updatedAt,
    });
  });

  it('serializes sport entry with explicitly provided named resource category', () => {
    const entry = {
      _id: entryId,
      ownerId,
      categoryId,
      date,
      itemName: 'Running Shoes ASICS Dynablast',
      costPln: 389.99,
      description: null,
      transactionId: null,
      createdAt,
      updatedAt,
    } as unknown as ISportEntry;

    const categoryResource = {
      _id: categoryId,
      name: 'Running',
      type: 'user' as const,
    };

    const result = serializeSportEntry(entry, categoryResource);

    expect(result.category).toEqual({
      id: categoryId.toString(),
      name: 'Running',
      type: 'user',
    });
  });

  it('serializes sport entry with populated category object', () => {
    const entry = {
      _id: entryId,
      ownerId,
      categoryId: {
        _id: categoryId,
        name: 'Cycling',
        type: 'user' as const,
      },
      date,
      itemName: 'Bicycle Helmet',
      costPln: 250,
      description: null,
      transactionId: null,
      createdAt,
      updatedAt,
    } as unknown as ISportEntry;

    const result = serializeSportEntry(entry);

    expect(result).toEqual({
      id: entryId.toString(),
      ownerId: ownerId.toString(),
      categoryId: categoryId.toString(),
      category: {
        id: categoryId.toString(),
        name: 'Cycling',
        type: 'user',
      },
      date,
      itemName: 'Bicycle Helmet',
      costPln: 250,
      description: null,
      transactionId: null,
      createdAt,
      updatedAt,
    });
  });

  it('throws error when category is neither passed nor populated', () => {
    const entry = {
      _id: entryId,
      ownerId,
      categoryId,
      date,
      itemName: 'Bicycle Helmet',
      costPln: 250,
      createdAt,
      updatedAt,
    } as unknown as ISportEntry;

    expect(() => serializeSportEntry(entry)).toThrow(
      'Category must be provided or populated to serialize sport entry',
    );
  });
});
