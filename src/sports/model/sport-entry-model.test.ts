import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { SportEntryModel } from './sport-entry-model';

describe('SportEntryModel', () => {
  it('accepts valid sport entry document', () => {
    const doc = new SportEntryModel({
      ownerId: new Types.ObjectId(),
      categoryId: new Types.ObjectId(),
      date: new Date('2026-05-08'),
      itemName: 'Running Shoes ASICS Dynablast',
      costPln: 389.99,
      description: 'Bought at discount',
      transactionId: new Types.ObjectId(),
    });

    expect(doc.validateSync()).toBeUndefined();
  });

  it('accepts sport entry without optional description and transactionId', () => {
    const doc = new SportEntryModel({
      ownerId: new Types.ObjectId(),
      categoryId: new Types.ObjectId(),
      date: new Date('2026-05-08'),
      itemName: 'Gym Membership',
      costPln: 120,
    });

    expect(doc.validateSync()).toBeUndefined();
    expect(doc.description).toBeNull();
    expect(doc.transactionId).toBeNull();
  });

  it('rejects missing required fields', () => {
    const doc = new SportEntryModel({});
    const err = doc.validateSync();

    expect(err?.errors.ownerId).toBeDefined();
    expect(err?.errors.categoryId).toBeDefined();
    expect(err?.errors.date).toBeDefined();
    expect(err?.errors.itemName).toBeDefined();
    expect(err?.errors.costPln).toBeDefined();
  });

  it('rejects negative costPln', () => {
    const doc = new SportEntryModel({
      ownerId: new Types.ObjectId(),
      categoryId: new Types.ObjectId(),
      date: new Date('2026-05-08'),
      itemName: 'Climbing Rope',
      costPln: -50,
    });

    const err = doc.validateSync();
    expect(err?.errors.costPln).toBeDefined();
  });

  it('rejects empty itemName', () => {
    const doc = new SportEntryModel({
      ownerId: new Types.ObjectId(),
      categoryId: new Types.ObjectId(),
      date: new Date('2026-05-08'),
      itemName: '   ',
      costPln: 100,
    });

    const err = doc.validateSync();
    expect(err?.errors.itemName).toBeDefined();
  });
});
