import { z } from 'zod/v4';

import { OBJECT_ID_REGEX } from '@utils/consts';

import { SPENDING_TYPES } from '../consts';

export const SpendingTypeSchema = z.enum([...SPENDING_TYPES]);

export const SpendingLinkItemSchema = z.object({
  spendingType: SpendingTypeSchema,
  spendingId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `spendingId`'),
});

export const LinkSpendingsToTransactionSchema = z.object({
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`'),
  spendings: z
    .array(SpendingLinkItemSchema)
    .min(1, 'At least one spending item must be specified'),
});

export const UnlinkSpendingFromTransactionSchema = z.object({
  spendingType: SpendingTypeSchema,
  spendingId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `spendingId`'),
});

export const SpendingLinkResponseSchema = z.object({
  acknowledged: z.boolean(),
  modifiedCount: z.number(),
});

export type SpendingTypeDTO = z.infer<typeof SpendingTypeSchema>;
export type SpendingLinkItemDTO = z.infer<typeof SpendingLinkItemSchema>;
export type LinkSpendingsToTransactionDTO = z.infer<
  typeof LinkSpendingsToTransactionSchema
>;
export type UnlinkSpendingFromTransactionDTO = z.infer<
  typeof UnlinkSpendingFromTransactionSchema
>;
export type SpendingLinkResponseDTO = z.infer<typeof SpendingLinkResponseSchema>;

z.globalRegistry.add(SpendingLinkItemSchema, { id: 'SpendingLinkItem' });
z.globalRegistry.add(LinkSpendingsToTransactionSchema, {
  id: 'LinkSpendingsToTransaction',
});
z.globalRegistry.add(UnlinkSpendingFromTransactionSchema, {
  id: 'UnlinkSpendingFromTransaction',
});
z.globalRegistry.add(SpendingLinkResponseSchema, { id: 'SpendingLinkResponse' });
