import { z } from 'zod/v4';

import { OBJECT_ID_REGEX } from '@utils/consts';

import {
  DEFAULT_VEHICLES_LIMIT,
  MAINTENANCE_SECTIONS,
  MAX_VEHICLES_LIMIT,
} from '../consts';

export const MaintenanceSectionSchema = z.enum([...MAINTENANCE_SECTIONS]);

export const VehicleMaintenanceCreateSchema = z.object({
  section: MaintenanceSectionSchema,
  date: z.coerce.date(),
  costPln: z.number().min(0, 'Cost must be non-negative'),
  odometerKm: z
    .number()
    .int()
    .nonnegative('Odometer reading must be non-negative')
    .optional(),
  description: z.string().max(1000).optional(),
  serviceProvider: z.string().trim().max(200).optional(),
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`')
    .nullable()
    .optional(),
});

export const VehicleMaintenanceUpdateSchema = VehicleMaintenanceCreateSchema.partial();

export const VehicleMaintenanceResponseSchema = z.object({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
  ownerId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`'),
  vehicleId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `vehicleId`'),
  sourceRow: z.number().optional(),
  section: MaintenanceSectionSchema,
  date: z.coerce.date(),
  costPln: z.number(),
  odometerKm: z.number().optional(),
  description: z.string().optional(),
  serviceProvider: z.string().optional(),
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`')
    .nullable()
    .optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const VehicleMaintenanceFilterQuerySchema = z.object({
  section: MaintenanceSectionSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_VEHICLES_LIMIT)
    .default(DEFAULT_VEHICLES_LIMIT),
});

export const VehicleMaintenanceListResponseSchema = z.array(
  VehicleMaintenanceResponseSchema,
);

export const VehicleMaintenanceParamsSchema = z.object({
  vehicleId: z.string().min(1, 'vehicleId is required'),
  recordId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `recordId`'),
});

export type VehicleMaintenanceCreateDTO = z.infer<typeof VehicleMaintenanceCreateSchema>;
export type VehicleMaintenanceUpdateDTO = z.infer<typeof VehicleMaintenanceUpdateSchema>;
export type VehicleMaintenanceResponseDTO = z.infer<
  typeof VehicleMaintenanceResponseSchema
>;
export type VehicleMaintenanceFilterQuery = z.infer<
  typeof VehicleMaintenanceFilterQuerySchema
>;
export type VehicleMaintenanceListResponseDTO = z.infer<
  typeof VehicleMaintenanceListResponseSchema
>;
export type VehicleMaintenanceParamsDTO = z.infer<typeof VehicleMaintenanceParamsSchema>;

z.globalRegistry.add(VehicleMaintenanceCreateSchema, {
  id: 'VehicleMaintenanceCreate',
});
z.globalRegistry.add(VehicleMaintenanceUpdateSchema, {
  id: 'VehicleMaintenanceUpdate',
});
z.globalRegistry.add(VehicleMaintenanceResponseSchema, {
  id: 'VehicleMaintenanceResponse',
});
z.globalRegistry.add(VehicleMaintenanceListResponseSchema, {
  id: 'VehicleMaintenanceListResponse',
});
