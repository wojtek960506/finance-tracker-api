import { z } from 'zod/v4';

import { OBJECT_ID_REGEX } from '@utils/consts';

export const SportStatsQuerySchema = z.object({
  year: z.coerce.number().int().min(1970).max(2100).optional(),
});

export const SportStatsCategorySchema = z.object({
  categoryId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for categoryId'),
  categoryName: z.string().min(1),
  categoryKey: z.string().nullable().optional(),
  type: z.enum(['user', 'system']),
  totalCostPln: z.number().nonnegative(),
  entryCount: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
});

export const SportStatsYearSchema = z.object({
  year: z.number().int(),
  totalCostPln: z.number().nonnegative(),
  entryCount: z.number().int().nonnegative(),
});

export const SportStatsMonthSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  totalCostPln: z.number().nonnegative(),
  entryCount: z.number().int().nonnegative(),
});

export const SportStatsResponseSchema = z.object({
  totalCostPln: z.number().nonnegative(),
  totalEntries: z.number().int().nonnegative(),
  byCategory: z.array(SportStatsCategorySchema),
  byYear: z.array(SportStatsYearSchema),
  byMonth: z.array(SportStatsMonthSchema).optional(),
});

export type SportStatsQueryDTO = z.infer<typeof SportStatsQuerySchema>;
export type SportStatsCategoryDTO = z.infer<typeof SportStatsCategorySchema>;
export type SportStatsYearDTO = z.infer<typeof SportStatsYearSchema>;
export type SportStatsMonthDTO = z.infer<typeof SportStatsMonthSchema>;
export type SportStatsResponseDTO = z.infer<typeof SportStatsResponseSchema>;

z.globalRegistry.add(SportStatsCategorySchema, { id: 'SportStatsCategory' });
z.globalRegistry.add(SportStatsYearSchema, { id: 'SportStatsYear' });
z.globalRegistry.add(SportStatsMonthSchema, { id: 'SportStatsMonth' });
z.globalRegistry.add(SportStatsResponseSchema, { id: 'SportStatsResponse' });
