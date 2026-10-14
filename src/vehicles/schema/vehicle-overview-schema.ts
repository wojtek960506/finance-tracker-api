import { z } from 'zod/v4';

import { OBJECT_ID_REGEX } from '@utils/consts';

import { MaintenanceSectionSchema } from './vehicle-maintenance-schema';

export const VehicleOverviewQuerySchema = z.object({
  activityLimit: z.coerce.number().int().min(1).max(100).default(10),
});

export const VehicleOverviewFuelStatsSchema = z.object({
  totalSpentPln: z.number().nonnegative(),
  totalLiters: z.number().nonnegative(),
  avgConsumptionLPer100Km: z.number().nonnegative().nullable(),
  costPerKmPln: z.number().nonnegative().nullable(),
  entriesCount: z.number().int().nonnegative(),
});

export const VehicleOverviewMaintenanceStatsSchema = z.object({
  totalSpentPln: z.number().nonnegative(),
  entriesCount: z.number().int().nonnegative(),
  bySection: z.object({
    ownMaintenance: z.object({
      costPln: z.number().nonnegative(),
      count: z.number().int().nonnegative(),
    }),
    previousOwnerServices: z.object({
      costPln: z.number().nonnegative(),
      count: z.number().int().nonnegative(),
    }),
  }),
});

export const VehicleOverviewEquipmentStatsSchema = z.object({
  totalSpentPln: z.number().nonnegative(),
  entriesCount: z.number().int().nonnegative(),
});

export const VehicleOverviewStatsSchema = z.object({
  currentOdometerKm: z.number().int().nonnegative().nullable(),
  minOdometerKm: z.number().int().nonnegative().nullable(),
  totalDistanceKm: z.number().int().nonnegative().nullable(),
  refuelingCount: z.number().int().nonnegative(),
  maintenanceCount: z.number().int().nonnegative(),
  equipmentCount: z.number().int().nonnegative(),
});

export const VehicleOverviewActivityTypeSchema = z.enum([
  'fuel',
  'maintenance',
  'equipment',
]);

export const VehicleOverviewActivityItemSchema = z.object({
  id: z.string(),
  type: VehicleOverviewActivityTypeSchema,
  date: z.coerce.date(),
  costPln: z.number(),
  title: z.string(),
  description: z.string().optional(),
  odometerKm: z.number().int().nonnegative().nullable().optional(),
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`')
    .nullable()
    .optional(),
  fuelLiters: z.number().optional(),
  isFullTank: z.boolean().optional(),
  consumptionLPer100Km: z.number().nullable().optional(),
  maintenanceSection: MaintenanceSectionSchema.optional(),
  serviceProvider: z.string().optional(),
});

export const VehicleOverviewResponseSchema = z.object({
  vehicleId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `vehicleId`'),
  totalSpentPln: z.number().nonnegative(),
  fuel: VehicleOverviewFuelStatsSchema,
  maintenance: VehicleOverviewMaintenanceStatsSchema,
  equipment: VehicleOverviewEquipmentStatsSchema,
  stats: VehicleOverviewStatsSchema,
  recentActivity: z.array(VehicleOverviewActivityItemSchema),
});

export type VehicleOverviewQueryDTO = z.infer<typeof VehicleOverviewQuerySchema>;
export type VehicleOverviewFuelStatsDTO = z.infer<typeof VehicleOverviewFuelStatsSchema>;
export type VehicleOverviewMaintenanceStatsDTO = z.infer<
  typeof VehicleOverviewMaintenanceStatsSchema
>;
export type VehicleOverviewEquipmentStatsDTO = z.infer<
  typeof VehicleOverviewEquipmentStatsSchema
>;
export type VehicleOverviewStatsDTO = z.infer<typeof VehicleOverviewStatsSchema>;
export type VehicleOverviewActivityType = z.infer<
  typeof VehicleOverviewActivityTypeSchema
>;
export type VehicleOverviewActivityItemDTO = z.infer<
  typeof VehicleOverviewActivityItemSchema
>;
export type VehicleOverviewResponseDTO = z.infer<typeof VehicleOverviewResponseSchema>;

z.globalRegistry.add(VehicleOverviewQuerySchema, { id: 'VehicleOverviewQuery' });
z.globalRegistry.add(VehicleOverviewFuelStatsSchema, { id: 'VehicleOverviewFuelStats' });
z.globalRegistry.add(VehicleOverviewMaintenanceStatsSchema, {
  id: 'VehicleOverviewMaintenanceStats',
});
z.globalRegistry.add(VehicleOverviewEquipmentStatsSchema, {
  id: 'VehicleOverviewEquipmentStats',
});
z.globalRegistry.add(VehicleOverviewStatsSchema, { id: 'VehicleOverviewStats' });
z.globalRegistry.add(VehicleOverviewActivityItemSchema, {
  id: 'VehicleOverviewActivityItem',
});
z.globalRegistry.add(VehicleOverviewResponseSchema, {
  id: 'VehicleOverviewResponse',
});
