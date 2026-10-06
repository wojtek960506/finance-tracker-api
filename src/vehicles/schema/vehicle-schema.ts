import { z } from 'zod/v4';

import { OBJECT_ID_REGEX } from '@utils/consts';

import { VEHICLE_TYPES } from '../consts';

export const VEHICLE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const VehicleTypeSchema = z.enum([...VEHICLE_TYPES]);

export const VehicleSlugSchema = z
  .string()
  .min(1, 'Slug cannot be empty')
  .max(100, 'Slug cannot exceed 100 characters')
  .regex(
    VEHICLE_SLUG_REGEX,
    'Slug must be lowercase alphanumeric with hyphens (e.g. "suzuki-sv-650")',
  );

export const VehicleCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  slug: VehicleSlugSchema.optional(),
  brand: z.string().trim().max(50).optional(),
  vehicleModel: z.string().trim().max(50).optional(),
  type: VehicleTypeSchema,
  productionYear: z.number().int().min(1900).max(2100).optional(),
  notes: z.string().max(1000).optional(),
});

export const VehicleUpdateSchema = VehicleCreateSchema.partial();

export const VehicleResponseSchema = z.object({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
  ownerId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`'),
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  brand: z.string().optional(),
  vehicleModel: z.string().optional(),
  type: VehicleTypeSchema,
  productionYear: z.number().optional(),
  notes: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const VehicleParamsSchema = z.object({
  vehicleId: z.string().min(1, 'vehicleId is required'),
});

export const VehicleListResponseSchema = z.array(VehicleResponseSchema);

export type VehicleCreateDTO = z.infer<typeof VehicleCreateSchema>;
export type VehicleUpdateDTO = z.infer<typeof VehicleUpdateSchema>;
export type VehicleResponseDTO = z.infer<typeof VehicleResponseSchema>;
export type VehicleListResponseDTO = z.infer<typeof VehicleListResponseSchema>;
export type VehicleParamsDTO = z.infer<typeof VehicleParamsSchema>;

z.globalRegistry.add(VehicleCreateSchema, { id: 'VehicleCreate' });
z.globalRegistry.add(VehicleUpdateSchema, { id: 'VehicleUpdate' });
z.globalRegistry.add(VehicleResponseSchema, { id: 'VehicleResponse' });
z.globalRegistry.add(VehicleListResponseSchema, { id: 'VehicleListResponse' });
