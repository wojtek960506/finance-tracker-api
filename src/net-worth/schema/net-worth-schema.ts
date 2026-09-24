import { z } from 'zod/v4';

import { CurrencyCodeSchema } from '@currency/schema';
import { OBJECT_ID_REGEX } from '@utils/consts';

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

const parseObjectIdList = (fieldName: string) =>
  z
    .string()
    .transform((value) => value.split(','))
    .refine(
      (values) => values.every((v) => OBJECT_ID_REGEX.test(v)),
      `Some value from \`${fieldName}\` doesn't have format of ObjectId`,
    );

export const NetWorthIndependenceQuerySchema = z.object({
  baseCurrency: CurrencyCodeSchema.optional(),
  periodMonths: z.coerce.number().int().min(1).max(120).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  excludeCategoryIds: parseObjectIdList('excludeCategoryIds').optional(),
  excludeCategoryNames: z
    .string()
    .transform((value) =>
      value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
    )
    .optional(),
});

export const NetWorthIndependencePeriodSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  monthsCount: z.number(),
});

export const NetWorthIndependenceCapitalSchema = z.object({
  total: z.number(),
  liquidCash: z.number(),
  savings: z.number(),
  liquidCapital: z.number(),
  lockedInvestments: z.number(),
});

export const NetWorthIndependenceMonthlyAveragesSchema = z.object({
  grossExpenses: z.number(),
  nonWorkIncome: z.number(),
  workIncome: z.number(),
  totalIncome: z.number(),
  netBurnRate: z.number(),
});

export const NetWorthIndependenceHorizonSchema = z.object({
  netWorthMonths: z.number().nullable(),
  liquidCapitalMonths: z.number().nullable(),
  liquidCashMonths: z.number().nullable(),
  isPerpetual: z.boolean(),
});

export const NetWorthZeroIncomeBaselineSchema = z.object({
  netWorthMonths: z.number().nullable(),
  liquidCapitalMonths: z.number().nullable(),
  liquidCashMonths: z.number().nullable(),
});

export const ExcludedCategoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const NetWorthIndependenceResponseSchema = z.object({
  baseCurrency: CurrencyCodeSchema.optional(),
  period: NetWorthIndependencePeriodSchema,
  netWorth: NetWorthIndependenceCapitalSchema,
  monthlyAverages: NetWorthIndependenceMonthlyAveragesSchema,
  independence: NetWorthIndependenceHorizonSchema,
  zeroIncomeBaseline: NetWorthZeroIncomeBaselineSchema,
  excludedCategories: z.array(ExcludedCategoryItemSchema),
});

export type NetWorthIndependenceQuery = z.infer<typeof NetWorthIndependenceQuerySchema>;
export type NetWorthIndependenceResponseDTO = z.infer<
  typeof NetWorthIndependenceResponseSchema
>;
export type NetWorthIndependenceCapitalDTO = z.infer<
  typeof NetWorthIndependenceCapitalSchema
>;
export type NetWorthIndependenceMonthlyAveragesDTO = z.infer<
  typeof NetWorthIndependenceMonthlyAveragesSchema
>;
export type NetWorthIndependenceHorizonDTO = z.infer<
  typeof NetWorthIndependenceHorizonSchema
>;
export type NetWorthZeroIncomeBaselineDTO = z.infer<
  typeof NetWorthZeroIncomeBaselineSchema
>;

z.globalRegistry.add(NetWorthTotalsSchema, { id: 'NetWorthTotals' });
z.globalRegistry.add(NetWorthCurrencyBreakdownSchema, {
  id: 'NetWorthCurrencyBreakdown',
});
z.globalRegistry.add(NetWorthAllocationItemSchema, {
  id: 'NetWorthAllocationItem',
});
z.globalRegistry.add(NetWorthResponseSchema, { id: 'NetWorthResponse' });
z.globalRegistry.add(NetWorthIndependencePeriodSchema, {
  id: 'NetWorthIndependencePeriod',
});
z.globalRegistry.add(NetWorthIndependenceCapitalSchema, {
  id: 'NetWorthIndependenceCapital',
});
z.globalRegistry.add(NetWorthIndependenceMonthlyAveragesSchema, {
  id: 'NetWorthIndependenceMonthlyAverages',
});
z.globalRegistry.add(NetWorthIndependenceHorizonSchema, {
  id: 'NetWorthIndependenceHorizon',
});
z.globalRegistry.add(NetWorthZeroIncomeBaselineSchema, {
  id: 'NetWorthZeroIncomeBaseline',
});
z.globalRegistry.add(ExcludedCategoryItemSchema, { id: 'ExcludedCategoryItem' });
z.globalRegistry.add(NetWorthIndependenceResponseSchema, {
  id: 'NetWorthIndependenceResponse',
});
