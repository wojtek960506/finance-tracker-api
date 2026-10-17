import { describe, expect, it } from 'vitest';

import {
  SportEntryCreateSchema,
  SportEntryFilterQuerySchema,
  SportEntryResponseSchema,
  SportEntryUpdateSchema,
} from './sport-entry-schema';

describe('sport-entry-schema', () => {
  const validObjectId = '665000000000000000000001';
  const categoryId = '665000000000000000000002';

  describe('SportEntryCreateSchema', () => {
    it('validates a complete, valid sport entry payload', () => {
      const data = {
        categoryId,
        date: '2026-05-08',
        itemName: 'Running Shoes ASICS Dynablast',
        costPln: 389.99,
        description: 'Bought at discount',
        transactionId: validObjectId,
      };

      const parsed = SportEntryCreateSchema.parse(data);
      expect(parsed.categoryId).toBe(categoryId);
      expect(parsed.costPln).toBe(389.99);
      expect(parsed.itemName).toBe('Running Shoes ASICS Dynablast');
      expect(parsed.transactionId).toBe(validObjectId);
    });

    it('allows optional description and transactionId to be omitted', () => {
      const data = {
        categoryId,
        date: '2026-05-08',
        itemName: 'Gym Membership',
        costPln: 150,
      };

      const parsed = SportEntryCreateSchema.parse(data);
      expect(parsed.description).toBeUndefined();
      expect(parsed.transactionId).toBeUndefined();
    });

    it('rejects invalid categoryId format', () => {
      const data = {
        categoryId: 'not-an-objectid',
        date: '2026-05-08',
        itemName: 'Gym Membership',
        costPln: 150,
      };

      expect(() => SportEntryCreateSchema.parse(data)).toThrow();
    });

    it('rejects negative costPln', () => {
      const data = {
        categoryId,
        date: '2026-05-08',
        itemName: 'Gym Membership',
        costPln: -10,
      };

      expect(() => SportEntryCreateSchema.parse(data)).toThrow();
    });

    it('rejects empty itemName', () => {
      const data = {
        categoryId,
        date: '2026-05-08',
        itemName: '   ',
        costPln: 150,
      };

      expect(() => SportEntryCreateSchema.parse(data)).toThrow();
    });
  });

  describe('SportEntryUpdateSchema', () => {
    it('allows partial updates', () => {
      const data = {
        costPln: 199.99,
      };

      const parsed = SportEntryUpdateSchema.parse(data);
      expect(parsed.costPln).toBe(199.99);
      expect(parsed.itemName).toBeUndefined();
    });
  });

  describe('SportEntryFilterQuerySchema', () => {
    it('applies defaults for sort, page, and limit', () => {
      const parsed = SportEntryFilterQuerySchema.parse({});
      expect(parsed.sort).toBe('date_desc');
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(50);
    });

    it('accepts valid filters and custom sort', () => {
      const parsed = SportEntryFilterQuerySchema.parse({
        categoryId,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        search: 'running',
        sort: 'cost_desc',
        page: '2',
        limit: '100',
      });

      expect(parsed.categoryId).toBe(categoryId);
      expect(parsed.sort).toBe('cost_desc');
      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(100);
      expect(parsed.search).toBe('running');
    });
  });

  describe('SportEntryResponseSchema', () => {
    it('validates a serialized response object', () => {
      const data = {
        id: validObjectId,
        ownerId: validObjectId,
        categoryId,
        category: {
          id: categoryId,
          name: 'Running',
          type: 'user',
        },
        date: new Date('2026-05-08'),
        itemName: 'Running Shoes',
        costPln: 389.99,
        description: null,
        transactionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parsed = SportEntryResponseSchema.parse(data);
      expect(parsed.id).toBe(validObjectId);
      expect(parsed.category.name).toBe('Running');
    });
  });
});
