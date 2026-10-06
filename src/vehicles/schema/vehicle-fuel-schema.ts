import { z } from 'zod/v4';

import { OBJECT_ID_REGEX } from '@utils/consts';

import { DEFAULT_VEHICLES_LIMIT, MAX_VEHICLES_LIMIT } from '../consts';

export const VehicleFuelEntryCreateSchema = z.object({
  date: z.coerce.date(),
  fuelLiters: z.number().positive('Fuel liters must be positive'),
  isFullTank: z.boolean().default(true),
  unitPricePln: z.number().positive('Unit price must be positive'),
  costPln: z.number().positive('Cost must be positive'),
  odometerKm: z.number().int().nonnegative('Odometer reading must be non-negative'),
  stationBrand: z.string().trim().max(100).optional(),
  stationAddress: z.string().trim().max(200).optional(),
  description: z.string().max(500).optional(),
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`')
    .nullable()
    .optional(),
});

export const VehicleFuelEntryUpdateSchema = VehicleFuelEntryCreateSchema.partial();

export const VehicleFuelEntryResponseSchema = z.object({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
  ownerId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`'),
  vehicleId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `vehicleId`'),
  sourceRow: z.number().optional(),
  date: z.coerce.date(),
  fuelLiters: z.number(),
  isFullTank: z.boolean(),
  unitPricePln: z.number(),
  costPln: z.number(),
  odometerKm: z.number(),
  stationBrand: z.string().optional(),
  stationAddress: z.string().optional(),
  description: z.string().optional(),
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`')
    .nullable()
    .optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const VehicleFuelEntryEnrichedResponseSchema =
  VehicleFuelEntryResponseSchema.extend({
    distanceSincePreviousKm: z.number().nullable(),
    distanceSincePreviousFullKm: z.number().nullable(),
    fuelLitersToFull: z.number().nullable(),
    costToFullPln: z.number().nullable(),
    consumptionLPer100Km: z.number().nullable(),
    costPerKmPln: z.number().nullable(),
    kmPerLiter: z.number().nullable(),
  });

export const VehicleFuelFilterQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isFullTank: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
  enriched: z
    .preprocess((val) => {
      if (val === 'false' || val === false) return false;
      return true;
    }, z.boolean().default(true))
    .default(true),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_VEHICLES_LIMIT)
    .default(DEFAULT_VEHICLES_LIMIT),
});

export const VehicleFuelEntryListResponseSchema = z.array(
  VehicleFuelEntryEnrichedResponseSchema,
);

export const VehicleFuelEntryParamsSchema = z.object({
  vehicleId: z.string().min(1, 'vehicleId is required'),
  entryId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `entryId`'),
});

export type VehicleFuelEntryCreateDTO = z.infer<typeof VehicleFuelEntryCreateSchema>;
export type VehicleFuelEntryUpdateDTO = z.infer<typeof VehicleFuelEntryUpdateSchema>;
export type VehicleFuelEntryResponseDTO = z.infer<typeof VehicleFuelEntryResponseSchema>;
export type VehicleFuelEntryEnrichedResponseDTO = z.infer<
  typeof VehicleFuelEntryEnrichedResponseSchema
>;
export type VehicleFuelFilterQuery = z.infer<typeof VehicleFuelFilterQuerySchema>;
export type VehicleFuelEntryListResponseDTO = z.infer<
  typeof VehicleFuelEntryListResponseSchema
>;
export type VehicleFuelEntryParamsDTO = z.infer<typeof VehicleFuelEntryParamsSchema>;

z.globalRegistry.add(VehicleFuelEntryCreateSchema, { id: 'VehicleFuelEntryCreate' });
z.globalRegistry.add(VehicleFuelEntryUpdateSchema, { id: 'VehicleFuelEntryUpdate' });
z.globalRegistry.add(VehicleFuelEntryResponseSchema, { id: 'VehicleFuelEntryResponse' });
z.globalRegistry.add(VehicleFuelEntryEnrichedResponseSchema, {
  id: 'VehicleFuelEntryEnrichedResponse',
});
z.globalRegistry.add(VehicleFuelEntryListResponseSchema, {
  id: 'VehicleFuelEntryListResponse',
});
