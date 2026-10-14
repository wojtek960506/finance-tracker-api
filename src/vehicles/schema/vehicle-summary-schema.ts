import { z } from 'zod/v4';

import { VehicleResponseSchema } from './vehicle-schema';

export const VehicleSpendingSummarySchema = z.object({
  fuelTotalPln: z.number().nonnegative('Fuel total must be non-negative'),
  maintenanceTotalPln: z.number().nonnegative('Maintenance total must be non-negative'),
  equipmentTotalPln: z.number().nonnegative('Equipment total must be non-negative'),
  totalSpentPln: z.number().nonnegative('Total spent must be non-negative'),
  lastOdometerKm: z.number().int().nonnegative().nullable(),
  totalDistanceKm: z.number().int().nonnegative().nullable(),
  fuelEntriesCount: z.number().int().nonnegative(),
  maintenanceCount: z.number().int().nonnegative(),
  equipmentCount: z.number().int().nonnegative(),
});

export const VehicleWithSpendingSchema = VehicleResponseSchema.extend({
  spending: VehicleSpendingSummarySchema,
});

export const GlobalVehiclesSummarySchema = z.object({
  totalVehicles: z.number().int().nonnegative(),
  totalSpentPln: z.number().nonnegative(),
  totalFuelSpentPln: z.number().nonnegative(),
  totalMaintenanceSpentPln: z.number().nonnegative(),
  totalEquipmentSpentPln: z.number().nonnegative(),
  totalDistanceKm: z.number().int().nonnegative(),
});

export const VehiclesSummaryResponseSchema = z.object({
  summary: GlobalVehiclesSummarySchema,
  vehicles: z.array(VehicleWithSpendingSchema),
});

export type VehicleSpendingSummaryDTO = z.infer<typeof VehicleSpendingSummarySchema>;
export type VehicleWithSpendingDTO = z.infer<typeof VehicleWithSpendingSchema>;
export type GlobalVehiclesSummaryDTO = z.infer<typeof GlobalVehiclesSummarySchema>;
export type VehiclesSummaryResponseDTO = z.infer<typeof VehiclesSummaryResponseSchema>;

z.globalRegistry.add(VehicleSpendingSummarySchema, { id: 'VehicleSpendingSummary' });
z.globalRegistry.add(VehicleWithSpendingSchema, { id: 'VehicleWithSpending' });
z.globalRegistry.add(GlobalVehiclesSummarySchema, { id: 'GlobalVehiclesSummary' });
z.globalRegistry.add(VehiclesSummaryResponseSchema, { id: 'VehiclesSummaryResponse' });
