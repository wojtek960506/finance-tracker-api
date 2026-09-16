import {
  INVESTMENT_OPERATION_CASH_FLOW_KINDS,
  INVESTMENT_OPERATION_KINDS,
} from '@investment/consts';
import { z } from 'zod/v4';

import { CurrencyCodeSchema } from '@currency/schema';
import { OBJECT_ID_REGEX } from '@utils/consts';

export const InvestmentOperationKindSchema = z.enum([...INVESTMENT_OPERATION_KINDS]);
export const InvestmentOperationCashFlowKindSchema = z.enum([
  ...INVESTMENT_OPERATION_CASH_FLOW_KINDS,
]);

const InvestmentOperationBaseSchema = z.object({
  instrumentId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `instrumentId`'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: CurrencyCodeSchema,
  date: z.coerce.date(),
  note: z.string().max(500).optional(),
});

export const InvestmentSnapshotOperationSchema = InvestmentOperationBaseSchema.extend({
  kind: z.literal('snapshot').optional(),
});

export const InvestmentSnapshotOperationItemSchema = InvestmentOperationBaseSchema.extend(
  {
    kind: z.literal('snapshot'),
  },
);

export const InvestmentCashFlowOperationSchema = InvestmentOperationBaseSchema.extend({
  kind: InvestmentOperationCashFlowKindSchema,
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`'),
});

export const InvestmentOperationSchema = z.discriminatedUnion('kind', [
  InvestmentCashFlowOperationSchema,
  InvestmentSnapshotOperationItemSchema,
]);

const InvestmentOperationBaseResponseSchema = InvestmentOperationBaseSchema.extend({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
  ownerId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InvestmentSnapshotOperationResponseSchema =
  InvestmentOperationBaseResponseSchema.extend({
    kind: z.literal('snapshot'),
  });

export const InvestmentCashFlowOperationResponseSchema =
  InvestmentOperationBaseResponseSchema.extend({
    kind: InvestmentOperationCashFlowKindSchema,
    transactionId: z
      .string()
      .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`'),
  });

export const InvestmentOperationResponseSchema = z.discriminatedUnion('kind', [
  InvestmentCashFlowOperationResponseSchema,
  InvestmentSnapshotOperationResponseSchema,
]);

export const InvestmentOperationsQuerySchema = z.object({
  instrumentId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `instrumentId`')
    .optional(),
  kind: InvestmentOperationKindSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const InvestmentOperationListResponseSchema = z.array(
  InvestmentOperationResponseSchema,
);

export type InvestmentSnapshotOperationDTO = z.infer<
  typeof InvestmentSnapshotOperationSchema
>;
export type InvestmentSnapshotOperationItemDTO = z.infer<
  typeof InvestmentSnapshotOperationItemSchema
>;
export type InvestmentCashFlowOperationDTO = z.infer<
  typeof InvestmentCashFlowOperationSchema
>;
export type InvestmentOperationDTO = z.infer<typeof InvestmentOperationSchema>;

export type InvestmentSnapshotOperationResponseDTO = z.infer<
  typeof InvestmentSnapshotOperationResponseSchema
>;
export type InvestmentCashFlowOperationResponseDTO = z.infer<
  typeof InvestmentCashFlowOperationResponseSchema
>;
export type InvestmentOperationResponseDTO = z.infer<
  typeof InvestmentOperationResponseSchema
>;
export type InvestmentOperationListResponseDTO = z.infer<
  typeof InvestmentOperationListResponseSchema
>;
export type InvestmentOperationsQuery = z.infer<typeof InvestmentOperationsQuerySchema>;

z.globalRegistry.add(InvestmentSnapshotOperationSchema, {
  id: 'InvestmentSnapshotOperation',
});
z.globalRegistry.add(InvestmentSnapshotOperationItemSchema, {
  id: 'InvestmentSnapshotOperationItem',
});
z.globalRegistry.add(InvestmentCashFlowOperationSchema, {
  id: 'InvestmentCashFlowOperation',
});
z.globalRegistry.add(InvestmentOperationSchema, { id: 'InvestmentOperation' });
z.globalRegistry.add(InvestmentSnapshotOperationResponseSchema, {
  id: 'InvestmentSnapshotOperationResponse',
});
z.globalRegistry.add(InvestmentCashFlowOperationResponseSchema, {
  id: 'InvestmentCashFlowOperationResponse',
});
z.globalRegistry.add(InvestmentOperationResponseSchema, {
  id: 'InvestmentOperationResponse',
});
z.globalRegistry.add(InvestmentOperationListResponseSchema, {
  id: 'InvestmentOperationListResponse',
});
