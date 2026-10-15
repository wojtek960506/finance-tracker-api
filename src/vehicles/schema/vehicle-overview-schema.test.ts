import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import {
  VehicleOverviewActivityItemSchema,
  VehicleOverviewQuerySchema,
  VehicleOverviewResponseSchema,
} from './vehicle-overview-schema';

describe('vehicle overview schema', () => {
  describe('VehicleOverviewQuerySchema', () => {
    it('applies default activityLimit = 10', () => {
      const parsed = VehicleOverviewQuerySchema.parse({});
      expect(parsed.activityLimit).toBe(10);
    });

    it('coerces string activityLimit', () => {
      const parsed = VehicleOverviewQuerySchema.parse({ activityLimit: '25' });
      expect(parsed.activityLimit).toBe(25);
    });

    it('rejects activityLimit out of bounds', () => {
      expect(VehicleOverviewQuerySchema.safeParse({ activityLimit: 0 }).success).toBe(
        false,
      );
      expect(VehicleOverviewQuerySchema.safeParse({ activityLimit: 101 }).success).toBe(
        false,
      );
    });
  });

  describe('VehicleOverviewActivityItemSchema', () => {
    it('accepts fuel activity item', () => {
      const result = VehicleOverviewActivityItemSchema.safeParse({
        id: 'fuel_123',
        type: 'fuel',
        date: new Date().toISOString(),
        costPln: 250,
        title: 'Orlen',
        description: 'Pb95 full tank',
        odometerKm: 145000,
        fuelLiters: 45,
        isFullTank: true,
        consumptionLPer100Km: 6.8,
      });

      expect(result.success).toBe(true);
    });

    it('accepts maintenance activity item', () => {
      const result = VehicleOverviewActivityItemSchema.safeParse({
        id: 'maint_123',
        type: 'maintenance',
        date: new Date().toISOString(),
        costPln: 450,
        title: 'Auto Serwis',
        description: 'Oil change',
        odometerKm: 140000,
        maintenanceSection: 'ownMaintenance',
        serviceProvider: 'Auto Serwis',
      });

      expect(result.success).toBe(true);
    });

    it('accepts equipment activity item', () => {
      const result = VehicleOverviewActivityItemSchema.safeParse({
        id: 'equip_123',
        type: 'equipment',
        date: new Date().toISOString(),
        costPln: 180,
        title: 'Phone mount',
      });

      expect(result.success).toBe(true);
    });

    it('rejects invalid activity type', () => {
      const result = VehicleOverviewActivityItemSchema.safeParse({
        id: 'invalid_1',
        type: 'insurance',
        date: new Date().toISOString(),
        costPln: 100,
        title: 'Insurance',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('VehicleOverviewResponseSchema', () => {
    it('accepts valid overview response with full stats and activities', () => {
      const vehicleId = new Types.ObjectId().toString();

      const result = VehicleOverviewResponseSchema.safeParse({
        vehicleId,
        totalSpentPln: 4150,
        fuel: {
          totalSpentPln: 2200,
          totalLiters: 345.5,
          avgConsumptionLPer100Km: 6.85,
          costPerKmPln: 0.45,
          entriesCount: 14,
        },
        maintenance: {
          totalSpentPln: 1500,
          entriesCount: 3,
        },
        equipment: {
          totalSpentPln: 450,
          entriesCount: 2,
        },
        stats: {
          currentOdometerKm: 142500,
          minOdometerKm: 135000,
          totalDistanceKm: 7500,
          refuelingCount: 14,
          maintenanceCount: 5,
          equipmentCount: 2,
        },
        recentActivity: [
          {
            id: 'fuel_1',
            type: 'fuel',
            date: new Date().toISOString(),
            costPln: 280.5,
            title: 'Orlen',
            odometerKm: 142500,
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('accepts null values for odometers, distances, and averages when no data exists', () => {
      const vehicleId = new Types.ObjectId().toString();

      const result = VehicleOverviewResponseSchema.safeParse({
        vehicleId,
        totalSpentPln: 0,
        fuel: {
          totalSpentPln: 0,
          totalLiters: 0,
          avgConsumptionLPer100Km: null,
          costPerKmPln: null,
          entriesCount: 0,
        },
        maintenance: {
          totalSpentPln: 0,
          entriesCount: 0,
        },
        equipment: {
          totalSpentPln: 0,
          entriesCount: 0,
        },
        stats: {
          currentOdometerKm: null,
          minOdometerKm: null,
          totalDistanceKm: null,
          refuelingCount: 0,
          maintenanceCount: 0,
          equipmentCount: 0,
        },
        recentActivity: [],
      });

      expect(result.success).toBe(true);
    });
  });
});
