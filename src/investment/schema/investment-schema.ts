import { z } from 'zod/v4';

import { CurrencyCodeSchema } from '@currency/schema';
import { OBJECT_ID_REGEX } from '@utils/consts';

import {
  INVESTMENT_INSTRUMENT_KINDS,
  INVESTMENT_OPERATION_CASH_FLOW_KINDS,
  INVESTMENT_OPERATION_KINDS,
} from '../consts';

const OptionalObjectIdSchema = z
  .string()
  .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format')
  .nullable()
  .optional();

export const InvestmentInstrumentKindSchema = z.enum([
  ...INVESTMENT_INSTRUMENT_KINDS,
]);

export const InvestmentOperationKindSchema = z.enum([
  ...INVESTMENT_OPERATION_KINDS,
]);

export const InvestmentInstrumentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  kind: InvestmentInstrumentKindSchema,
  currency: CurrencyCodeSchema,
  notes: z.string().max(500).optional(),
});

export const InvestmentInstrumentResponseSchema = InvestmentInstrumentSchema.extend({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
  ownerId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`'),
  nameNormalized: z.string().min(1).max(60),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InvestmentOperationSchema = z
  .object({
    instrumentId: z
      .string()
      .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `instrumentId`'),
    transactionId: OptionalObjectIdSchema,
    kind: InvestmentOperationKindSchema,
    amount: z.number().min(0, 'Amount must be non-negative'),
    currency: CurrencyCodeSchema,
    date: z.coerce.date(),
    note: z.string().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.kind === 'snapshot') {
      if (value.transactionId != null) {
        ctx.addIssue({
          code: 'custom',
          path: ['transactionId'],
          message: 'Snapshot operation cannot be bound to a transaction',
        });
      }
      return;
    }

    if (value.transactionId == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['transactionId'],
        message: 'Transaction is required for non-snapshot investment operations',
      });
    }

    if (!INVESTMENT_OPERATION_CASH_FLOW_KINDS.has(value.kind)) {
      ctx.addIssue({
        code: 'custom',
        path: ['kind'],
        message: 'Invalid investment operation kind',
      });
    }
  });

export const InvestmentOperationResponseSchema = InvestmentOperationSchema.extend({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
  ownerId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InvestmentInstrumentListResponseSchema = z.array(
  InvestmentInstrumentResponseSchema,
);

export const InvestmentOperationListResponseSchema = z.array(
  InvestmentOperationResponseSchema,
);

export type InvestmentInstrumentDTO = z.infer<typeof InvestmentInstrumentSchema>;
export type InvestmentInstrumentResponseDTO = z.infer<
  typeof InvestmentInstrumentResponseSchema
>;
export type InvestmentOperationDTO = z.infer<typeof InvestmentOperationSchema>;
export type InvestmentOperationResponseDTO = z.infer<
  typeof InvestmentOperationResponseSchema
>;
export type InvestmentInstrumentListResponseDTO = z.infer<
  typeof InvestmentInstrumentListResponseSchema
>;
export type InvestmentOperationListResponseDTO = z.infer<
  typeof InvestmentOperationListResponseSchema
>;

z.globalRegistry.add(InvestmentInstrumentSchema, { id: 'InvestmentInstrument' });
z.globalRegistry.add(InvestmentInstrumentResponseSchema, {
  id: 'InvestmentInstrumentResponse',
});
z.globalRegistry.add(InvestmentOperationSchema, { id: 'InvestmentOperation' });
z.globalRegistry.add(InvestmentOperationResponseSchema, {
  id: 'InvestmentOperationResponse',
});
z.globalRegistry.add(InvestmentInstrumentListResponseSchema, {
  id: 'InvestmentInstrumentListResponse',
});
z.globalRegistry.add(InvestmentOperationListResponseSchema, {
  id: 'InvestmentOperationListResponse',
});

