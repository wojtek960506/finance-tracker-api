import { z } from 'zod/v4';

import { CurrencyCode, CurrencyCodeSchema } from '@currency/schema';
import { TransactionResponseDTO, TransactionResponseSchema } from '@transaction/schema';

export const DashboardSummaryQuerySchema = z.object({
  baseCurrency: CurrencyCodeSchema.default('PLN'),
  recentLimit: z.coerce.number().int().min(1).max(20).default(10),
});

export const DashboardTransactionCurrencyItemSchema = z.object({
  totalItems: z.number().int(),
  totalExpenseAmount: z.number(),
  totalIncomeAmount: z.number(),
});

export const DashboardTransactionsSummarySchema = z.object({
  totalItems: z.number().int(),
  totalExpenseAmount: z.number(),
  totalIncomeAmount: z.number(),
  byCurrency: z.record(z.string(), DashboardTransactionCurrencyItemSchema).optional(),
});

export const DashboardInvestmentsSummarySchema = z.object({
  totalCurrentValue: z.number(),
  totalNetInvested: z.number(),
  totalPnL: z.number(),
  roiPercentage: z.number(),
  instrumentsCount: z.number().int(),
});

export const DashboardVehiclesSummarySchema = z.object({
  totalVehicles: z.number().int(),
  totalSpentPln: z.number(),
  totalFuelSpentPln: z.number(),
  totalMaintenanceSpentPln: z.number(),
  totalEquipmentSpentPln: z.number(),
});

export const DashboardSportsSummarySchema = z.object({
  totalCostPln: z.number(),
  totalEntries: z.number().int(),
  categoriesCount: z.number().int(),
});

export const DashboardSummaryResponseSchema = z.object({
  baseCurrency: CurrencyCodeSchema,
  transactions: DashboardTransactionsSummarySchema,
  investments: DashboardInvestmentsSummarySchema,
  vehicles: DashboardVehiclesSummarySchema,
  sports: DashboardSportsSummarySchema,
  recentTransactions: z.array(TransactionResponseSchema),
});

export type DashboardSummaryQuery = z.infer<typeof DashboardSummaryQuerySchema>;
export type DashboardTransactionCurrencyItemDTO = z.infer<
  typeof DashboardTransactionCurrencyItemSchema
>;
export type DashboardTransactionsSummaryDTO = z.infer<
  typeof DashboardTransactionsSummarySchema
>;
export type DashboardInvestmentsSummaryDTO = z.infer<
  typeof DashboardInvestmentsSummarySchema
>;
export type DashboardVehiclesSummaryDTO = z.infer<typeof DashboardVehiclesSummarySchema>;
export type DashboardSportsSummaryDTO = z.infer<typeof DashboardSportsSummarySchema>;
export type DashboardSummaryResponseDTO = {
  baseCurrency: CurrencyCode;
  transactions: DashboardTransactionsSummaryDTO;
  investments: DashboardInvestmentsSummaryDTO;
  vehicles: DashboardVehiclesSummaryDTO;
  sports: DashboardSportsSummaryDTO;
  recentTransactions: TransactionResponseDTO[];
};

z.globalRegistry.add(DashboardTransactionCurrencyItemSchema, {
  id: 'DashboardTransactionCurrencyItem',
});
z.globalRegistry.add(DashboardTransactionsSummarySchema, {
  id: 'DashboardTransactionsSummary',
});
z.globalRegistry.add(DashboardInvestmentsSummarySchema, {
  id: 'DashboardInvestmentsSummary',
});
z.globalRegistry.add(DashboardVehiclesSummarySchema, {
  id: 'DashboardVehiclesSummary',
});
z.globalRegistry.add(DashboardSportsSummarySchema, {
  id: 'DashboardSportsSummary',
});
z.globalRegistry.add(DashboardSummaryResponseSchema, {
  id: 'DashboardSummaryResponse',
});
