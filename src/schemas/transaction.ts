import { z } from "zod";
import { excludeFromSet } from "@utils/set";
import {
  ACCOUNTS,
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
} from "@utils/consts";


const TransactionCreateCommonSchema = z.object({
  date: z.coerce.date(), // allows strings like "2025-10-24" -> Date
}) 

/**
 * Create Transaction Schema
 * Used for POST /transactions
 */
export const TransactionCreateStandardSchema = TransactionCreateCommonSchema.extend({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum([...CURRENCIES]),
  category: z.enum([...excludeFromSet(CATEGORIES, ["myAccount", "exchange"])]),
  paymentMethod: z.enum([...PAYMENT_METHODS]),
  account: z.enum([...ACCOUNTS]),
  transactionType: z.enum([...TRANSACTION_TYPES]),
});

export const TransactionCreateExchangeSchema = TransactionCreateCommonSchema.extend({
  additionalDescription: z.string().min(1, "Additional description cannot be empty").optional(),
  amountExpense: z.number().positive("Amount of expense in exchange must be positive"),
  amountIncome: z.number().positive("Amount of income in exchange must be positive"),
  currencyExpense: z.enum([...CURRENCIES]),
  currencyIncome: z.enum([...CURRENCIES]),
  account: z.enum([...ACCOUNTS]),
  paymentMethod: z.enum(["bankTransfer", "cash"]),
})

export const TransactionCreateTransferSchema = TransactionCreateCommonSchema.extend({
  additionalDescription: z.string().min(1, "Additional description cannot be empty").optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum([...CURRENCIES]),
  accountExpense: z.enum([...ACCOUNTS]),
  accountIncome: z.enum([...ACCOUNTS]),
  paymentMethod: z.enum(["bankTransfer", "cash", "card"]),
})

export const TransactionUpdateStandardSchema = TransactionCreateStandardSchema;

export const TransactionResponseSchema = TransactionCreateStandardSchema.extend({
  id: z.string(),
  ownerId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format for `ownerId`"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // TODO - probably move it to create schema later while enhancing logic for adding transaction
  sourceIndex: z.number(),
  sourceRefIndex: z.number().optional(),
  refId: z.string().regex(
    /^[0-9a-fA-F]{24}$/, "Invalid ObjectId format for `refId`"
  ).optional(),
  currencies: z.string()
  .min(7, "'currencies' must be in format 'XXX/XXX'")
  .max(7, "'currencies' must be in format 'XXX/XXX'").optional(),
  exchangeRate: z.number().optional(),
})

export const TransactionsResponseSchema = z.array(TransactionResponseSchema);

/**
 * TypeScript types for convenience
 */
export type TransactionCreateStandardDTO = z.infer<typeof TransactionCreateStandardSchema>;
export type TransactionCreateExchangeDTO = z.infer<typeof TransactionCreateExchangeSchema>;
export type TransactionCreateTransferDTO = z.infer<typeof TransactionCreateTransferSchema>;
export type TransactionUpdateStandardDTO = z.infer<typeof TransactionUpdateStandardSchema>;
export type TransactionResponseDTO = z.infer<typeof TransactionResponseSchema>;
export type TransactionsResponseDTO = z.infer<typeof TransactionsResponseSchema>;
