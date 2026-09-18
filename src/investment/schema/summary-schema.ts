import { z } from 'zod/v4';

import { CurrencyCodeSchema } from '@currency/schema';
import { OBJECT_ID_REGEX } from '@utils/consts';

import { InvestmentInstrumentKindSchema } from './instrument-schema';

export const InvestmentInstrumentSummarySchema = z.object({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
  name: z.string().min(1).max(100),
  kind: InvestmentInstrumentKindSchema,
  currency: CurrencyCodeSchema,
  currentValue: z.number(),
  netInvested: z.number(),
  totalBought: z.number(),
  totalSold: z.number(),
  totalInterest: z.number(),
  totalFees: z.number(),
  pnl: z.number(),
  roiPercentage: z.number(),
  lastSnapshotDate: z.coerce.date().nullable(),
  operationsCount: z.number(),
  notes: z.string().max(500).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InvestmentCurrencySummarySchema = z.object({
  currency: CurrencyCodeSchema,
  totalCurrentValue: z.number(),
  totalNetInvested: z.number(),
  totalBought: z.number(),
  totalSold: z.number(),
  totalInterest: z.number(),
  totalFees: z.number(),
  totalPnL: z.number(),
  roiPercentage: z.number(),
  instrumentsCount: z.number(),
});

export const InvestmentSummaryResponseSchema = z.object({
  totalsByCurrency: z.record(z.string(), InvestmentCurrencySummarySchema),
  instruments: z.array(InvestmentInstrumentSummarySchema),
});

export type InvestmentInstrumentSummaryDTO = z.infer<
  typeof InvestmentInstrumentSummarySchema
>;
export type InvestmentCurrencySummaryDTO = z.infer<
  typeof InvestmentCurrencySummarySchema
>;
export type InvestmentSummaryResponseDTO = z.infer<
  typeof InvestmentSummaryResponseSchema
>;

z.globalRegistry.add(InvestmentInstrumentSummarySchema, {
  id: 'InvestmentInstrumentSummary',
});
z.globalRegistry.add(InvestmentCurrencySummarySchema, {
  id: 'InvestmentCurrencySummary',
});
z.globalRegistry.add(InvestmentSummaryResponseSchema, {
  id: 'InvestmentSummaryResponse',
});
