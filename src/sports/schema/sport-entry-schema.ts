import { z } from 'zod/v4';

import { OBJECT_ID_REGEX } from '@utils/consts';

import {
  DEFAULT_SPORT_ENTRY_SORT,
  DEFAULT_SPORTS_LIMIT,
  MAX_SPORTS_LIMIT,
  SPORT_ENTRY_SORT_OPTIONS,
} from '../consts';

export const SportEntryCategoryResponseSchema = z.object({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for category id'),
  name: z.string().min(1),
  type: z.enum(['user', 'system']),
});

export const SportEntryCreateSchema = z.object({
  categoryId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for categoryId'),
  date: z.coerce.date(),
  itemName: z.string().trim().min(1, 'Item name is required').max(200),
  costPln: z.number().min(0, 'Cost must be non-negative'),
  description: z.string().max(500).nullable().optional(),
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for transactionId')
    .nullable()
    .optional(),
});

export const SportEntryUpdateSchema = SportEntryCreateSchema.partial();

export const SportEntryResponseSchema = z.object({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for id'),
  ownerId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for ownerId'),
  categoryId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for categoryId'),
  category: SportEntryCategoryResponseSchema,
  date: z.coerce.date(),
  itemName: z.string().min(1).max(200),
  costPln: z.number().nonnegative(),
  description: z.string().nullable().optional(),
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for transactionId')
    .nullable()
    .optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const SportEntryFilterQuerySchema = z.object({
  categoryId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for categoryId')
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().trim().optional(),
  sort: z.enum(SPORT_ENTRY_SORT_OPTIONS).default(DEFAULT_SPORT_ENTRY_SORT),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_SPORTS_LIMIT)
    .default(DEFAULT_SPORTS_LIMIT),
});

export const SportPaginationSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const SportEntryListResponseSchema = z.object({
  items: z.array(SportEntryResponseSchema),
  pagination: SportPaginationSchema,
});

export const SportEntryParamsSchema = z.object({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for id'),
});

export type SportEntryCategoryResponseDTO = z.infer<
  typeof SportEntryCategoryResponseSchema
>;
export type SportEntryCreateDTO = z.infer<typeof SportEntryCreateSchema>;
export type SportEntryUpdateDTO = z.infer<typeof SportEntryUpdateSchema>;
export type SportEntryResponseDTO = z.infer<typeof SportEntryResponseSchema>;
export type SportEntryFilterQueryDTO = z.infer<typeof SportEntryFilterQuerySchema>;
export type SportPaginationDTO = z.infer<typeof SportPaginationSchema>;
export type SportEntryListResponseDTO = z.infer<typeof SportEntryListResponseSchema>;
export type SportEntryParamsDTO = z.infer<typeof SportEntryParamsSchema>;

z.globalRegistry.add(SportEntryCategoryResponseSchema, {
  id: 'SportEntryCategoryResponse',
});
z.globalRegistry.add(SportEntryCreateSchema, { id: 'SportEntryCreate' });
z.globalRegistry.add(SportEntryUpdateSchema, { id: 'SportEntryUpdate' });
z.globalRegistry.add(SportEntryResponseSchema, { id: 'SportEntryResponse' });
z.globalRegistry.add(SportPaginationSchema, { id: 'SportPagination' });
z.globalRegistry.add(SportEntryListResponseSchema, {
  id: 'SportEntryListResponse',
});
