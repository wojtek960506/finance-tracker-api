import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import {
  GlobalVehiclesSummarySchema,
  VehicleSpendingSummarySchema,
  VehiclesSummaryResponseSchema,
} from './vehicle-summary-schema';

describe('vehicle summary schema', () => {
  describe('VehicleSpendingSummarySchema', () => {
    it('accepts valid spending summary with odometer', () => {
      const result = VehicleSpendingSummarySchema.safeParse({
        fuelTotalPln: 2200.5,
        maintenanceTotalPln: 1500,
        equipmentTotalPln: 450,
        totalSpentPln: 4150.5,
        lastOdometerKm: 142500,
        fuelEntriesCount: 14,
        maintenanceCount: 3,
        equipmentCount: 2,
      });

      expect(result.success).toBe(true);
    });

    it('accepts null lastOdometerKm when vehicle has no odometer records', () => {
      const result = VehicleSpendingSummarySchema.safeParse({
        fuelTotalPln: 0,
        maintenanceTotalPln: 0,
        equipmentTotalPln: 0,
        totalSpentPln: 0,
        lastOdometerKm: null,
        fuelEntriesCount: 0,
        maintenanceCount: 0,
        equipmentCount: 0,
      });

      expect(result.success).toBe(true);
    });

    it('rejects negative spending amounts', () => {
      const result = VehicleSpendingSummarySchema.safeParse({
        fuelTotalPln: -10,
        maintenanceTotalPln: 0,
        equipmentTotalPln: 0,
        totalSpentPln: 0,
        lastOdometerKm: null,
        fuelEntriesCount: 0,
        maintenanceCount: 0,
        equipmentCount: 0,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('GlobalVehiclesSummarySchema', () => {
    it('accepts valid global summary', () => {
      const result = GlobalVehiclesSummarySchema.safeParse({
        totalVehicles: 2,
        totalSpentPln: 8450,
        totalFuelSpentPln: 4200,
        totalMaintenanceSpentPln: 3100,
        totalEquipmentSpentPln: 1150,
      });

      expect(result.success).toBe(true);
    });

    it('rejects negative vehicle counts or totals', () => {
      expect(
        GlobalVehiclesSummarySchema.safeParse({
          totalVehicles: -1,
          totalSpentPln: 100,
          totalFuelSpentPln: 100,
          totalMaintenanceSpentPln: 0,
          totalEquipmentSpentPln: 0,
        }).success,
      ).toBe(false);
    });
  });

  describe('VehiclesSummaryResponseSchema', () => {
    it('accepts valid full summary response', () => {
      const vehicleId = new Types.ObjectId().toString();
      const ownerId = new Types.ObjectId().toString();

      const result = VehiclesSummaryResponseSchema.safeParse({
        summary: {
          totalVehicles: 1,
          totalSpentPln: 4150,
          totalFuelSpentPln: 2200,
          totalMaintenanceSpentPln: 1500,
          totalEquipmentSpentPln: 450,
        },
        vehicles: [
          {
            id: vehicleId,
            ownerId,
            slug: 'toyota-corolla-2018',
            name: 'Daily Corolla',
            brand: 'Toyota',
            vehicleModel: 'Corolla',
            type: 'car',
            productionYear: 2018,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            spending: {
              fuelTotalPln: 2200,
              maintenanceTotalPln: 1500,
              equipmentTotalPln: 450,
              totalSpentPln: 4150,
              lastOdometerKm: 142500,
              fuelEntriesCount: 14,
              maintenanceCount: 3,
              equipmentCount: 2,
            },
          },
        ],
      });

      expect(result.success).toBe(true);
    });
  });
});
