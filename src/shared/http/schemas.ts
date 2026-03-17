import { z } from 'zod/v4';

export const ParamsJustIdSchema = z.object({
  id: z.string().describe('Resource id'),
});

export const DeleteResultSchema = z.object({
  acknowledged: z.boolean(),
  deletedCount: z.number(),
});

export const DeleteManyReplySchema = DeleteResultSchema;
