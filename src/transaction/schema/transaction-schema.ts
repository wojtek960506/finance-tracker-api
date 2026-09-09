import { InvestmentInstrumentKindSchema } from '@investment/schema';
import { z } from 'zod/v4';

import { CurrencyCodeSchema } from '@currency/schema';
import { NamedResourceResponseSchema } from '@named-resource';
import { OBJECT_ID_REGEX, TRANSACTION_KINDS, TRANSACTION_TYPES } from '@utils/consts';

export const TransactionKindSchema = z.enum([...TRANSACTION_KINDS]);

const OptionalObjectIdSchema = z
  .string()
  .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format')
  .nullable()
  .optional();

const TransactionCommonSchema = z.object({
  date: z.coerce.date(), // allows strings like "2025-10-24" -> Date
  description: z.string().min(1, 'Description is required'),
});

/**
 * Schema for standard transaction
 * Used for POST /transactions/standard and PUT /transactions/standard
 */
export const TransactionStandardSchema = TransactionCommonSchema.extend({
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: CurrencyCodeSchema,
  categoryId: OptionalObjectIdSchema,
  paymentMethodId: OptionalObjectIdSchema,
  accountId: OptionalObjectIdSchema,
  transactionType: z.enum([...TRANSACTION_TYPES]),
});

/**
 * Schema for exchange transaction
 * Used for POST /transactions/exchange and PUT /transactions/exchange
 */
export const TransactionExchangeSchema = TransactionCommonSchema.extend({
  amountExpense: z.number().min(0, 'Amount of expense in exchange must be non-negative'),
  amountIncome: z.number().min(0, 'Amount of income in exchange must be non-negative'),
  currencyExpense: CurrencyCodeSchema,
  currencyIncome: CurrencyCodeSchema,
  accountExpenseId: OptionalObjectIdSchema,
  accountIncomeId: OptionalObjectIdSchema,
  paymentMethodId: OptionalObjectIdSchema,
});

/**
 * Schema for transfer transaction
 * Used for POST /transactions/transfer and PUT /transactions/transfer
 */
export const TransactionTransferSchema = TransactionCommonSchema.extend({
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: CurrencyCodeSchema,
  accountExpenseId: OptionalObjectIdSchema,
  accountIncomeId: OptionalObjectIdSchema,
  paymentMethodId: OptionalObjectIdSchema,
});

export const TransactionInvestmentNewInstrumentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  kind: InvestmentInstrumentKindSchema.default('share'),
  currency: CurrencyCodeSchema.optional(),
  notes: z.string().max(500).optional(),
});

const TransactionInvestmentBaseDetailsSchema = z.object({
  operationKind: z.enum(['buy', 'sell', 'interest', 'fee']),
  note: z.string().max(500).optional(),
});

export const TransactionInvestmentExistingInstrumentDetailsSchema =
  TransactionInvestmentBaseDetailsSchema.extend({
    instrumentId: z
      .string()
      .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `instrumentId`'),
    newInstrument: z.undefined().optional(),
  });

export const TransactionInvestmentNewInstrumentDetailsSchema =
  TransactionInvestmentBaseDetailsSchema.extend({
    instrumentId: z.undefined().optional(),
    newInstrument: TransactionInvestmentNewInstrumentSchema,
  });

export const TransactionInvestmentDetailsSchema = z.union([
  TransactionInvestmentExistingInstrumentDetailsSchema,
  TransactionInvestmentNewInstrumentDetailsSchema,
]);

/**
 * Schema for investment transaction
 * Used for POST /transactions/investment and PUT /transactions/investment
 */
export const TransactionInvestmentSchema = TransactionStandardSchema.extend({
  transactionType: z.enum([...TRANSACTION_TYPES]).optional(),
  investment: TransactionInvestmentDetailsSchema,
});

export const TransactionBulkItemStandardSchema = TransactionStandardSchema.extend({
  kind: z.literal('standard'),
});

export const TransactionBulkItemExchangeSchema = TransactionExchangeSchema.extend({
  kind: z.literal('exchange'),
});

export const TransactionBulkItemTransferSchema = TransactionTransferSchema.extend({
  kind: z.literal('transfer'),
});

export const TransactionBulkItemInvestmentSchema = TransactionInvestmentSchema.extend({
  kind: z.literal('investment'),
});

export const TransactionCreateBulkItemSchema = z.discriminatedUnion('kind', [
  TransactionBulkItemStandardSchema,
  TransactionBulkItemExchangeSchema,
  TransactionBulkItemTransferSchema,
  TransactionBulkItemInvestmentSchema,
]);

export const TransactionBulkCreateSchema = z.object({
  transactions: z.array(TransactionCreateBulkItemSchema).min(1),
});

export const TransactionInvestmentResponseDetailsSchema = z.object({
  operationKind: z.enum(['buy', 'sell', 'interest', 'fee']),
  instrument: z.object({
    id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
    name: z.string(),
    kind: InvestmentInstrumentKindSchema,
    currency: CurrencyCodeSchema,
  }),
  note: z.string().optional(),
});

export const TransactionResponseSchema = TransactionStandardSchema.omit({
  categoryId: true,
  paymentMethodId: true,
  accountId: true,
}).extend({
  id: z.string(),
  kind: TransactionKindSchema,
  ownerId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  sourceIndex: z.number(),
  sourceRefIndex: z.number().optional(),
  refId: z
    .string()
    .regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `refId`')
    .optional(),
  currencies: z
    .string()
    .min(7, "'currencies' must be in format 'XXX/XXX'")
    .max(7, "'currencies' must be in format 'XXX/XXX'")
    .optional(),
  exchangeRate: z.number().optional(),
  category: NamedResourceResponseSchema.pick({ id: true, type: true, name: true }),
  paymentMethod: NamedResourceResponseSchema.pick({ id: true, type: true, name: true }),
  account: NamedResourceResponseSchema.pick({ id: true, type: true, name: true }),
  investment: TransactionInvestmentResponseDetailsSchema.optional(),
});

export const TransactionDeletionSchema = z.object({
  deletedAt: z.coerce.date(),
  purgeAt: z.coerce.date(),
});

export const TransactionDetailsResponseSchema = TransactionResponseSchema.extend({
  reference: TransactionResponseSchema.optional(),
});

export const TrashedTransactionResponseSchema = TransactionResponseSchema.extend({
  deletion: TransactionDeletionSchema,
});

export const TrashedTransactionDetailsResponseSchema =
  TrashedTransactionResponseSchema.extend({
    reference: TrashedTransactionResponseSchema.optional(),
  });

export const TransactionsResponseSchema = z.array(TransactionResponseSchema);
export const TrashedTransactionsResponseSchema = z.array(
  TrashedTransactionResponseSchema,
);

export const TestTransactionsCreateSchema = z
  .object({
    totalTransactions: z.number().min(200),
  })
  .optional();

export const TestTransactionsCreateResponseSchema = z.object({
  insertedCount: z.number(),
});

/**
 * TypeScript types for convenience
 */
export type TransactionStandardDTO = z.infer<typeof TransactionStandardSchema>;
export type TransactionExchangeDTO = z.infer<typeof TransactionExchangeSchema>;
export type TransactionTransferDTO = z.infer<typeof TransactionTransferSchema>;
export type TransactionInvestmentNewInstrumentDTO = z.infer<
  typeof TransactionInvestmentNewInstrumentSchema
>;
export type TransactionInvestmentDetailsDTO = z.infer<
  typeof TransactionInvestmentDetailsSchema
>;
export type TransactionInvestmentDTO = z.infer<typeof TransactionInvestmentSchema>;
export type TransactionInvestmentResponseDetailsDTO = z.infer<
  typeof TransactionInvestmentResponseDetailsSchema
>;
export type TransactionBulkItemStandardDTO = z.infer<
  typeof TransactionBulkItemStandardSchema
>;
export type TransactionBulkItemExchangeDTO = z.infer<
  typeof TransactionBulkItemExchangeSchema
>;
export type TransactionBulkItemTransferDTO = z.infer<
  typeof TransactionBulkItemTransferSchema
>;
export type TransactionBulkItemInvestmentDTO = z.infer<
  typeof TransactionBulkItemInvestmentSchema
>;
export type TransactionCreateBulkItemDTO = z.infer<
  typeof TransactionCreateBulkItemSchema
>;
export type TransactionBulkCreateDTO = z.infer<typeof TransactionBulkCreateSchema>;
export type TransactionResponseDTO = z.infer<typeof TransactionResponseSchema>;
export type TransactionDetailsResponseDTO = z.infer<
  typeof TransactionDetailsResponseSchema
>;
export type TransactionDeletionDTO = z.infer<typeof TransactionDeletionSchema>;
export type TrashedTransactionResponseDTO = z.infer<
  typeof TrashedTransactionResponseSchema
>;
export type TrashedTransactionDetailsResponseDTO = z.infer<
  typeof TrashedTransactionDetailsResponseSchema
>;
export type TransactionsResponseDTO = z.infer<typeof TransactionsResponseSchema>;
export type TrashedTransactionsResponseDTO = z.infer<
  typeof TrashedTransactionsResponseSchema
>;
export type TestTransactionsCreateDTO = z.infer<typeof TestTransactionsCreateSchema>;
export type TestTransactionsCreateResponse = z.infer<
  typeof TestTransactionsCreateResponseSchema
>;

z.globalRegistry.add(TransactionStandardSchema, { id: 'TransactionStandard' });
z.globalRegistry.add(TransactionExchangeSchema, { id: 'TransactionExchange' });
z.globalRegistry.add(TransactionTransferSchema, { id: 'TransactionTransfer' });
z.globalRegistry.add(TransactionInvestmentNewInstrumentSchema, {
  id: 'TransactionInvestmentNewInstrument',
});
z.globalRegistry.add(TransactionInvestmentDetailsSchema, {
  id: 'TransactionInvestmentDetails',
});
z.globalRegistry.add(TransactionInvestmentSchema, { id: 'TransactionInvestment' });
z.globalRegistry.add(TransactionInvestmentResponseDetailsSchema, {
  id: 'TransactionInvestmentResponseDetails',
});
z.globalRegistry.add(TransactionCreateBulkItemSchema, {
  id: 'TransactionCreateBulkItem',
});
z.globalRegistry.add(TransactionBulkCreateSchema, { id: 'TransactionBulkCreate' });
z.globalRegistry.add(TransactionResponseSchema, { id: 'TransactionResponse' });
z.globalRegistry.add(TransactionDetailsResponseSchema, {
  id: 'TransactionDetailsResponse',
});
z.globalRegistry.add(TransactionDeletionSchema, { id: 'TransactionDeletion' });
z.globalRegistry.add(TrashedTransactionResponseSchema, {
  id: 'TrashedTransactionResponse',
});
z.globalRegistry.add(TrashedTransactionDetailsResponseSchema, {
  id: 'TrashedTransactionDetailsResponse',
});
z.globalRegistry.add(TransactionsResponseSchema, { id: 'TransactionsResponse' });
z.globalRegistry.add(TrashedTransactionsResponseSchema, {
  id: 'TrashedTransactionsResponse',
});
z.globalRegistry.add(TestTransactionsCreateSchema, { id: 'TestTransactionsCreate' });
z.globalRegistry.add(TestTransactionsCreateResponseSchema, {
  id: 'TestTransactionsCreateResponse',
});
