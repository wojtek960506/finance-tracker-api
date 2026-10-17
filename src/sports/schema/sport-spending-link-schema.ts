import { z } from 'zod/v4';

import { OBJECT_ID_REGEX } from '@utils/consts';

export const LinkSportSpendingsToTransactionSchema = z.object({
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`'),
  entryIds: z
    .array(z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `entryId`'))
    .min(1, 'At least one sport entry must be specified'),
});

export const UnlinkSportSpendingFromTransactionSchema = z.object({
  entryId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `entryId`'),
});

export const SportSpendingLinkResponseSchema = z.object({
  acknowledged: z.boolean(),
  modifiedCount: z.number(),
});

export type LinkSportSpendingsToTransactionDTO = z.infer<
  typeof LinkSportSpendingsToTransactionSchema
>;
export type UnlinkSportSpendingFromTransactionDTO = z.infer<
  typeof UnlinkSportSpendingFromTransactionSchema
>;
export type SportSpendingLinkResponseDTO = z.infer<
  typeof SportSpendingLinkResponseSchema
>;

z.globalRegistry.add(LinkSportSpendingsToTransactionSchema, {
  id: 'LinkSportSpendingsToTransaction',
});
z.globalRegistry.add(UnlinkSportSpendingFromTransactionSchema, {
  id: 'UnlinkSportSpendingFromTransaction',
});
z.globalRegistry.add(SportSpendingLinkResponseSchema, {
  id: 'SportSpendingLinkResponse',
});
