import { z } from "zod";

/**
 * Create Transaction Schema
 * Used for POST /transactions
 */
export const TransactionCreateSchema = z.object({
  date: z.coerce.date(), // allows strings like "2025-10-24" -> Date
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3, "Currency should be a 3-letter code (e.g. 'PLN')"),
  category: z.string().min(1, "Category is required"),
  paymentMethod: z.enum(["cash", "card", "blik", "transfer", "atm"]),
  account: z.string().min(1, "Account is required"),
  transactionType: z.enum(["income", "expense"]),
  idx: z.number().positive("Idx must be positive").optional(),
  exchangeRate: z.number().positive("Exchange rate must be positive").optional(),
  currencies: z.string().length(
    7, "Currencies should be 2 values of 3 letters codes separated with slash (e.g. 'EUR/PLN')"
  ).optional(),
  calcRefIdx: z.number().default(-1).optional(),
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
  _id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  __v: z.number(),
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
