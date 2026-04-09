import { z } from 'zod/v4';

import { CurrencyCodeSchema } from '@currency/schema';
import { OBJECT_ID_REGEX, TRANSACTION_TYPES } from '@utils/consts';

const TransactionCommonQuerySchema = z.object({
  categoryId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `categoryId`')
    .optional(),
  paymentMethodId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `paymentMethodId`')
    .optional(),
  accountId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `accountId`')
    .optional(),
  excludeCategoryIds: z
    .string()
    .transform((value) => value.split(','))
    .refine(
      (values) => values.every((v) => OBJECT_ID_REGEX.test(v)),
      "Some value from `excludeCategoryIds` doesn't have format of ObjectId",
    )
    .optional(),
});

export const TransactionFiltersQuerySchema = TransactionCommonQuerySchema.extend({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  transactionType: z.enum([...TRANSACTION_TYPES]).optional(),
  currency: CurrencyCodeSchema.optional(),
});

export const TransactionQuerySchema = TransactionFiltersQuerySchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  sortBy: z.enum(['date', 'amount']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const TrashTransactionQuerySchema = TransactionFiltersQuerySchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['deletedAt', 'purgeAt', 'date', 'amount'])
    .optional()
    .default('deletedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const TransactionStatisticsQuerySchema = TransactionCommonQuerySchema.extend({
  year: z.coerce.number().min(0).optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  transactionType: z.enum([...TRANSACTION_TYPES]),
  currency: CurrencyCodeSchema,
});

export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;
export type TransactionFiltersQuery = z.infer<typeof TransactionFiltersQuerySchema>;
export type TrashTransactionQuery = z.infer<typeof TrashTransactionQuerySchema>;
export type TransactionStatisticsQuery = z.infer<typeof TransactionStatisticsQuerySchema>;
