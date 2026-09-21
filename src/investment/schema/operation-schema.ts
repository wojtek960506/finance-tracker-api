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

export const InvestmentOperationCreateSchema = InvestmentOperationBaseSchema.extend({
  kind: z.enum(['snapshot', 'interest', 'fee']).default('snapshot'),
});

export const InvestmentSnapshotOperationItemSchema = InvestmentOperationBaseSchema.extend(
  {
    kind: z.literal('snapshot'),
  },
);

export const InvestmentStandaloneCashFlowOperationItemSchema =
  InvestmentOperationBaseSchema.extend({
    kind: z.enum(['interest', 'fee']),
    transactionId: z
      .string()
      .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`')
      .nullable()
      .optional(),
  });

export const InvestmentCashFlowOperationSchema = InvestmentOperationBaseSchema.extend({
  kind: z.enum(['buy', 'sell']),
  transactionId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`'),
});

export const InvestmentOperationSchema = z.discriminatedUnion('kind', [
  InvestmentCashFlowOperationSchema,
  InvestmentSnapshotOperationItemSchema,
  InvestmentStandaloneCashFlowOperationItemSchema,
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
      .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`')
      .nullable()
      .optional(),
  });

export const InvestmentOperationResponseSchema = z.discriminatedUnion('kind', [
  InvestmentCashFlowOperationResponseSchema,
  InvestmentSnapshotOperationResponseSchema,
]);

export const InvestmentOperationUpdateSchema = z.object({
  instrumentId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `instrumentId`')
    .optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  currency: CurrencyCodeSchema.optional(),
  date: z.coerce.date().optional(),
  note: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

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

export type InvestmentOperationCreateDTO = z.infer<
  typeof InvestmentOperationCreateSchema
>;
export type InvestmentSnapshotOperationItemDTO = z.infer<
  typeof InvestmentSnapshotOperationItemSchema
>;
export type InvestmentCashFlowOperationDTO = z.infer<
  typeof InvestmentCashFlowOperationSchema
>;
export type InvestmentOperationDTO = z.infer<typeof InvestmentOperationSchema>;
export type InvestmentOperationUpdateDTO = z.infer<
  typeof InvestmentOperationUpdateSchema
>;

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

z.globalRegistry.add(InvestmentOperationCreateSchema, {
  id: 'InvestmentOperationCreate',
});
z.globalRegistry.add(InvestmentSnapshotOperationItemSchema, {
  id: 'InvestmentSnapshotOperationItem',
});
z.globalRegistry.add(InvestmentCashFlowOperationSchema, {
  id: 'InvestmentCashFlowOperation',
});
z.globalRegistry.add(InvestmentOperationSchema, { id: 'InvestmentOperation' });
z.globalRegistry.add(InvestmentOperationUpdateSchema, {
  id: 'InvestmentOperationUpdate',
});
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
