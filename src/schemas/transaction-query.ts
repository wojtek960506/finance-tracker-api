import {
  ACCOUNTS,
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
} from "@utils/consts";
import { z } from "zod";

const TransacionFiltersQuerySchema = z.object({
  // fitlering options
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  transactionType: z.enum([...TRANSACTION_TYPES]).optional(),
  currency: z.enum([...CURRENCIES]).optional(),
  category: z.enum([...CATEGORIES]).optional(),
  paymentMethod: z.enum([...PAYMENT_METHODS]).optional(),
  account: z.enum([...ACCOUNTS]).optional(),
})

export type TransactionFiltersQuery = z.infer<typeof TransacionFiltersQuerySchema>;

export const TransactionQuerySchema = TransacionFiltersQuerySchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  sortBy: z.enum(["date", "amount"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});



export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;

export const TransactionTotalsQuerySchema = TransacionFiltersQuerySchema.extend({
  excludeCategories: z
    .string()
    .transform(value => value.split(","))
    .refine(
      v => v.every(value => [...CATEGORIES].includes(value))
      , "everyExcludedCategoryOneOfEnums"
    )
    .optional(),
});

export type TransactionTotalsQuery = z.infer<typeof TransactionTotalsQuerySchema>;

export const TransactionStatisticsQuerySchema = z.object({
  year: z.coerce.number().min(0).optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  transactionType: z.enum([...TRANSACTION_TYPES]),
  currency: z.enum([...CURRENCIES]),
  category: z.enum([...CATEGORIES]).optional(),
  excludeCategories: z
    .string()
    .transform(value => value.split(","))
    .refine(
      v => v.every(value => [...CATEGORIES].includes(value))
      , "everyExcludedCategoryOneOfEnums"
    )
    .optional(),
  paymentMethod: z.enum([...PAYMENT_METHODS]).optional(),
  account: z.enum([...ACCOUNTS]).optional(),
})

export type TransactionStatisticsQuery = z.infer<typeof TransactionStatisticsQuerySchema>;