import {
  ACCOUNTS,
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES
} from "@utils/consts";
import { z } from "zod";

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  sortBy: z.enum(["date", "amount"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),

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
});

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;


export const transactionAnalysisQuerySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  transactionType: z.enum([...TRANSACTION_TYPES]),
  currency: z.enum([...CURRENCIES]),
  category: z.enum([...CATEGORIES]).optional(),
  paymentMethod: z.enum([...PAYMENT_METHODS]).optional(),
  account: z.enum([...ACCOUNTS]).optional(),
})

export type TransactionAnalysisQuery = z.infer<typeof transactionAnalysisQuerySchema>;

export const transactionStatisticsQuerySchema = z.object({
  year: z.coerce.number().min(0).optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  transactionType: z.enum([...TRANSACTION_TYPES]),
  currency: z.enum([...CURRENCIES]),

  category: z.enum([...CATEGORIES]).optional(),
  paymentMethod: z.enum([...PAYMENT_METHODS]).optional(),
  account: z.enum([...ACCOUNTS]).optional(),
})

export type TransactionStatisticsQuery = z.infer<typeof transactionStatisticsQuerySchema>;