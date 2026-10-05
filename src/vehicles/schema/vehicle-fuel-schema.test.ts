import { describe, expect, it } from 'vitest';

import {
  VehicleFuelEntryCreateSchema,
  VehicleFuelFilterQuerySchema,
} from './vehicle-fuel-schema';

describe('vehicle fuel schema', () => {
  describe('VehicleFuelEntryCreateSchema', () => {
    it('accepts valid fuel entry create payload', () => {
      const result = VehicleFuelEntryCreateSchema.safeParse({
        date: '2026-05-01',
        fuelLiters: 14.2,
        isFullTank: true,
        unitPricePln: 6.45,
        costPln: 91.59,
        odometerKm: 42100,
        stationBrand: 'Orlen',
      });

      expect(result.success).toBe(true);
    });

    it('rejects negative or zero fuel liters', () => {
      expect(
        VehicleFuelEntryCreateSchema.safeParse({
          date: '2026-05-01',
          fuelLiters: 0,
          unitPricePln: 6.45,
          costPln: 91.59,
          odometerKm: 42100,
        }).success,
      ).toBe(false);
    });

    it('rejects invalid transactionId format', () => {
      expect(
        VehicleFuelEntryCreateSchema.safeParse({
          date: '2026-05-01',
          fuelLiters: 10,
          unitPricePln: 6.5,
          costPln: 65,
          odometerKm: 42100,
          transactionId: 'invalid-id',
        }).success,
      ).toBe(false);
    });
  });

  describe('VehicleFuelFilterQuerySchema', () => {
    it('parses string query params correctly', () => {
      const result = VehicleFuelFilterQuerySchema.safeParse({
        isFullTank: 'true',
        enriched: 'true',
        page: '2',
        limit: '25',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isFullTank).toBe(true);
        expect(result.data.enriched).toBe(true);
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(25);
      }
    });
  });
});
