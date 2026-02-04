import { z } from "zod";
import { CategoryResponseSchema } from "@schemas/category";
import {
  ACCOUNTS,
  CURRENCIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
} from "@utils/consts";


const TransactionCommonSchema = z.object({
  date: z.coerce.date(), // allows strings like "2025-10-24" -> Date
}) 

/**
 * Schema for standard transaction
 * Used for POST /transactions/standard and PUT /transactions/standard
 */
export const TransactionStandardSchema = TransactionCommonSchema.extend({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum([...CURRENCIES]),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format for `categoryId`"),
  paymentMethod: z.enum([...PAYMENT_METHODS]),
  account: z.enum([...ACCOUNTS]),
  transactionType: z.enum([...TRANSACTION_TYPES]),
});

/**
 * Schema for exchange transaction
 * Used for POST /transactions/exchange and PUT /transactions/exchange
 */
export const TransactionExchangeSchema = TransactionCommonSchema.extend({
  additionalDescription: z.string().min(1, "Additional description cannot be empty").optional(),
  amountExpense: z.number().positive("Amount of expense in exchange must be positive"),
  amountIncome: z.number().positive("Amount of income in exchange must be positive"),
  currencyExpense: z.enum([...CURRENCIES]),
  currencyIncome: z.enum([...CURRENCIES]),
  account: z.enum([...ACCOUNTS]),
  paymentMethod: z.enum(["bankTransfer", "cash"]),
})

/**
 * Schema for transfer transaction
 * Used for POST /transactions/transfer and PUT /transactions/transfer
 */
export const TransactionTransferSchema = TransactionCommonSchema.extend({
  additionalDescription: z.string().min(1, "Additional description cannot be empty").optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum([...CURRENCIES]),
  accountExpense: z.enum([...ACCOUNTS]),
  accountIncome: z.enum([...ACCOUNTS]),
  paymentMethod: z.enum(["bankTransfer", "cash", "card"]),
})

export const TransactionResponseSchema = TransactionStandardSchema
  .omit({ categoryId: true })
  .extend({
    id: z.string(),
    ownerId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format for `ownerId`"),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    sourceIndex: z.number(),
    sourceRefIndex: z.number().optional(),
    refId: z.string().regex(
      /^[0-9a-fA-F]{24}$/, "Invalid ObjectId format for `refId`"
    ).optional(),
    currencies: z.string()
    .min(7, "'currencies' must be in format 'XXX/XXX'")
    .max(7, "'currencies' must be in format 'XXX/XXX'").optional(),
    exchangeRate: z.number().optional(),
    category: CategoryResponseSchema.pick({ id: true, type: true, name: true }),
  }
)

export const TransactionsResponseSchema = z.array(TransactionResponseSchema);

/**
 * TypeScript types for convenience
 */
export type TransactionStandardDTO = z.infer<typeof TransactionStandardSchema>;
export type TransactionExchangeDTO = z.infer<typeof TransactionExchangeSchema>;
export type TransactionTransferDTO = z.infer<typeof TransactionTransferSchema>;
export type TransactionResponseDTO = z.infer<typeof TransactionResponseSchema>;
export type TransactionsResponseDTO = z.infer<typeof TransactionsResponseSchema>;
