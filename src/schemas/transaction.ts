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
  exchangeRate: z.number().positive("Exchange rate must be positive").optional(),
  currencies: z.string().length(
    7, "Currencies should be 2 values of 3 letters codes separated with slash (e.g. 'EUR/PLN')"
  ).optional(),
});

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
export type TransactionUpdateDTO = z.infer<typeof TransactionUpdateSchema>;
export type TransactionPatchDTO = z.infer<typeof TransactionPatchSchema>;
export type TransactionResponseDTO = z.infer<typeof TransactionResponseSchema>;
export type TransactionsResponseDTO = z.infer<typeof TransactionsResponseSchema>;
