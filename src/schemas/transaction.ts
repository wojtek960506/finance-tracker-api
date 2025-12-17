import {
  ACCOUNTS,
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES
} from "@utils/consts";
import { z } from "zod";

/**
 * Create Transaction Schema
 * Used for POST /transactions
 */
export const TransactionCreateSchema = z.object({
  date: z.coerce.date(), // allows strings like "2025-10-24" -> Date
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum([...CURRENCIES]),
  category: z.enum([...CATEGORIES]),
  paymentMethod: z.enum([...PAYMENT_METHODS]),
  account: z.enum([...ACCOUNTS]),
  transactionType: z.enum([...TRANSACTION_TYPES]),
});

export const TransactionCreateExchageSchema = z.object({
  date: z.coerce.date(), // allows strings like "2025-10-24" -> Date
  additionalDescription: z.string().min(1, "Additional description cannot be empty").optional(),
  amountExpense: z.number().positive("Amount of expense in exchange must be positive"),
  amountIncome: z.number().positive("Amount of income in exchange must be positive"),
  currencyExpense: z.enum([...CURRENCIES]),
  currencyIncome: z.enum([...CURRENCIES]),
  account: z.enum([...ACCOUNTS]),
  paymentMethod: z.enum(["bankTransfer", "cash"]),
})

/**
 * Full Update Schema (PUT)
 * Requires all fields (same as create)
 */
export const TransactionUpdateSchema = TransactionCreateSchema;

/**
 * Partial Update Schema (PATCH)
 * All fields optional
 */
export const TransactionPatchSchema = TransactionCreateSchema.partial();

export const TransactionResponseSchema = TransactionCreateSchema.extend({
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
})

export const TransactionsResponseSchema = z.array(TransactionResponseSchema);

/**
 * TypeScript types for convenience
 */
export type TransactionCreateDTO = z.infer<typeof TransactionCreateSchema>;
export type TransactionCreateExchangeDTO = z.infer<typeof TransactionCreateExchageSchema>;
export type TransactionUpdateDTO = z.infer<typeof TransactionUpdateSchema>;
export type TransactionPatchDTO = z.infer<typeof TransactionPatchSchema>;
export type TransactionResponseDTO = z.infer<typeof TransactionResponseSchema>;
export type TransactionsResponseDTO = z.infer<typeof TransactionsResponseSchema>;
