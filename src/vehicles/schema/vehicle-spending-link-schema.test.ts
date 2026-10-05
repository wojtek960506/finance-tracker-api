import { describe, expect, it } from 'vitest';

import {
  LinkSpendingsToTransactionSchema,
  UnlinkSpendingFromTransactionSchema,
} from './vehicle-spending-link-schema';

describe('vehicle spending link schema', () => {
  const validObjectId1 = '507f1f77bcf86cd799439011';
  const validObjectId2 = '507f1f77bcf86cd799439012';

  describe('LinkSpendingsToTransactionSchema', () => {
    it('accepts valid linking payload with multiple spendings', () => {
      const result = LinkSpendingsToTransactionSchema.safeParse({
        transactionId: validObjectId1,
        spendings: [
          { spendingType: 'fuel', spendingId: validObjectId1 },
          { spendingType: 'equipment', spendingId: validObjectId2 },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('rejects empty spendings array', () => {
      const result = LinkSpendingsToTransactionSchema.safeParse({
        transactionId: validObjectId1,
        spendings: [],
      });

      expect(result.success).toBe(false);
    });

    it('rejects invalid spending type', () => {
      const result = LinkSpendingsToTransactionSchema.safeParse({
        transactionId: validObjectId1,
        spendings: [{ spendingType: 'insurance', spendingId: validObjectId1 }],
      });

      expect(result.success).toBe(false);
    });
  });

  describe('UnlinkSpendingFromTransactionSchema', () => {
    it('accepts valid unlinking payload', () => {
      const result = UnlinkSpendingFromTransactionSchema.safeParse({
        spendingType: 'maintenance',
        spendingId: validObjectId1,
      });

      expect(result.success).toBe(true);
    });
  });
});
