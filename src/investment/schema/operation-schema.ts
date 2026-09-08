import {
  INVESTMENT_OPERATION_CASH_FLOW_KINDS,
  INVESTMENT_OPERATION_KINDS,
} from '@investment/consts';
import { z } from 'zod/v4';

import { CurrencyCodeSchema } from '@currency/schema';
import { OBJECT_ID_REGEX } from '@utils/consts';

const OptionalObjectIdSchema = z
  .string()
  .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format')
  .nullable()
  .optional();

export const InvestmentOperationKindSchema = z.enum([...INVESTMENT_OPERATION_KINDS]);

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
  ownerId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InvestmentSnapshotOperationSchema = z.object({
  instrumentId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `instrumentId`'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: CurrencyCodeSchema,
  date: z.coerce.date(),
  note: z.string().max(500).optional(),
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

export type InvestmentSnapshotOperationDTO = z.infer<
  typeof InvestmentSnapshotOperationSchema
>;
export type InvestmentOperationsQuery = z.infer<typeof InvestmentOperationsQuerySchema>;
export type InvestmentOperationDTO = z.infer<typeof InvestmentOperationSchema>;
export type InvestmentOperationResponseDTO = z.infer<
  typeof InvestmentOperationResponseSchema
>;
export type InvestmentOperationListResponseDTO = z.infer<
  typeof InvestmentOperationListResponseSchema
>;

z.globalRegistry.add(InvestmentSnapshotOperationSchema, {
  id: 'InvestmentSnapshotOperation',
});
z.globalRegistry.add(InvestmentOperationSchema, { id: 'InvestmentOperation' });
z.globalRegistry.add(InvestmentOperationResponseSchema, {
  id: 'InvestmentOperationResponse',
});
z.globalRegistry.add(InvestmentOperationListResponseSchema, {
  id: 'InvestmentOperationListResponse',
});
