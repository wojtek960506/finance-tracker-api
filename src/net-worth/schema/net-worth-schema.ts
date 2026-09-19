import { z } from 'zod/v4';

import { CurrencyCodeSchema } from '@currency/schema';

import { NET_WORTH_CATEGORIES } from '../consts';

export const NetWorthCategorySchema = z.enum([...NET_WORTH_CATEGORIES]);

export const NetWorthQuerySchema = z.object({
  baseCurrency: CurrencyCodeSchema.optional(),
});

export const NetWorthTotalsSchema = z.object({
  total: z.number(),
  liquidCash: z.number(),
  investments: z.number(),
});

export const NetWorthCurrencyBreakdownSchema = z.object({
  currency: CurrencyCodeSchema,
  cash: z.number(),
  investments: z.number(),
  total: z.number(),
  normalizedTotal: z.number().optional(),
});

export const NetWorthAllocationItemSchema = z.object({
  category: NetWorthCategorySchema,
  amount: z.number(),
  percentage: z.number(),
});

export const NetWorthResponseSchema = z.object({
  baseCurrency: CurrencyCodeSchema.optional(),
  netWorth: NetWorthTotalsSchema,
  byCurrency: z.record(z.string(), NetWorthCurrencyBreakdownSchema),
  allocation: z.record(z.string(), NetWorthAllocationItemSchema),
});

export type NetWorthQuery = z.infer<typeof NetWorthQuerySchema>;
export type NetWorthTotalsDTO = z.infer<typeof NetWorthTotalsSchema>;
export type NetWorthCurrencyBreakdownDTO = z.infer<
  typeof NetWorthCurrencyBreakdownSchema
>;
export type NetWorthAllocationItemDTO = z.infer<typeof NetWorthAllocationItemSchema>;
export type NetWorthResponseDTO = z.infer<typeof NetWorthResponseSchema>;

z.globalRegistry.add(NetWorthTotalsSchema, { id: 'NetWorthTotals' });
z.globalRegistry.add(NetWorthCurrencyBreakdownSchema, {
  id: 'NetWorthCurrencyBreakdown',
});
z.globalRegistry.add(NetWorthAllocationItemSchema, {
  id: 'NetWorthAllocationItem',
});
z.globalRegistry.add(NetWorthResponseSchema, { id: 'NetWorthResponse' });
