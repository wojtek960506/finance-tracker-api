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
  transactionType: z.enum(["income", "expense"]),
  paymentMethod: z.enum(["cash", "card", "blik", "transfer", "atm"]),
  account: z.string().min(1, "Account is required"),
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

/**
 * TypeScript types for convenience
 */
export type TransactionCreateDTO = z.infer<typeof TransactionCreateSchema>;
export type TransactionUpdateDTO = z.infer<typeof TransactionUpdateSchema>;
export type TransactionPatchDTO = z.infer<typeof TransactionPatchSchema>;