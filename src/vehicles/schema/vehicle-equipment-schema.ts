import { z } from 'zod/v4';

import { OBJECT_ID_REGEX } from '@utils/consts';

import { DEFAULT_VEHICLES_LIMIT, MAX_VEHICLES_LIMIT } from '../consts';

export const VehicleEquipmentCreateSchema = z.object({
  date: z.coerce.date(),
  itemName: z.string().trim().min(1, 'Item name is required').max(200),
  costPln: z.number().min(0, 'Cost must be non-negative'),
  description: z.string().max(500).optional(),
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`')
    .nullable()
    .optional(),
});

export const VehicleEquipmentUpdateSchema = VehicleEquipmentCreateSchema.partial();

export const VehicleEquipmentResponseSchema = z.object({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
  ownerId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`'),
  vehicleId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `vehicleId`'),
  sourceRow: z.number().optional(),
  date: z.coerce.date(),
  itemName: z.string().min(1).max(200),
  costPln: z.number(),
  description: z.string().optional(),
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`')
    .nullable()
    .optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const VehicleEquipmentFilterQuerySchema = z.object({
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

export const VehicleEquipmentListResponseSchema = z.array(VehicleEquipmentResponseSchema);

export type VehicleEquipmentCreateDTO = z.infer<typeof VehicleEquipmentCreateSchema>;
export type VehicleEquipmentUpdateDTO = z.infer<typeof VehicleEquipmentUpdateSchema>;
export type VehicleEquipmentResponseDTO = z.infer<typeof VehicleEquipmentResponseSchema>;
export type VehicleEquipmentFilterQuery = z.infer<
  typeof VehicleEquipmentFilterQuerySchema
>;
export type VehicleEquipmentListResponseDTO = z.infer<
  typeof VehicleEquipmentListResponseSchema
>;

z.globalRegistry.add(VehicleEquipmentCreateSchema, { id: 'VehicleEquipmentCreate' });
z.globalRegistry.add(VehicleEquipmentUpdateSchema, { id: 'VehicleEquipmentUpdate' });
z.globalRegistry.add(VehicleEquipmentResponseSchema, { id: 'VehicleEquipmentResponse' });
z.globalRegistry.add(VehicleEquipmentListResponseSchema, {
  id: 'VehicleEquipmentListResponse',
});
