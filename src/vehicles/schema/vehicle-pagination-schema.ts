import { z } from 'zod/v4';

export const VehiclePaginationSchema = z.object({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
  total: z.number().int().nonnegative(),
});

export type VehiclePaginationDTO = z.infer<typeof VehiclePaginationSchema>;

z.globalRegistry.add(VehiclePaginationSchema, { id: 'VehiclePagination' });
