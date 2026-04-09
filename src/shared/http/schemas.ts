import { z } from 'zod/v4';

export const ParamsJustIdSchema = z.object({
  id: z.string().describe('Resource id'),
});

export const DeleteResultSchema = z.object({
  acknowledged: z.boolean(),
  deletedCount: z.number(),
});

export const DeleteManyReplySchema = DeleteResultSchema;

export const UpdateManyReplySchema = z.object({
  acknowledged: z.boolean(),
  matchedCount: z.number(),
  modifiedCount: z.number(),
});
