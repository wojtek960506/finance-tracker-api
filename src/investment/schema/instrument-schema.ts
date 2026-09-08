import { INVESTMENT_INSTRUMENT_KINDS } from '@investment/consts';
import { z } from 'zod/v4';

import { CurrencyCodeSchema } from '@currency/schema';
import { OBJECT_ID_REGEX } from '@utils/consts';

export const InvestmentInstrumentKindSchema = z.enum([...INVESTMENT_INSTRUMENT_KINDS]);

export const InvestmentInstrumentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  kind: InvestmentInstrumentKindSchema,
  currency: CurrencyCodeSchema,
  notes: z.string().max(500).optional(),
});

export const InvestmentInstrumentResponseSchema = InvestmentInstrumentSchema.extend({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `id`'),
  ownerId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `ownerId`'),
  nameNormalized: z.string().min(1).max(60),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InvestmentInstrumentUpdateSchema = InvestmentInstrumentSchema.partial();

export const InvestmentInstrumentFilterQuerySchema = z.object({
  kind: InvestmentInstrumentKindSchema.optional(),
  currency: CurrencyCodeSchema.optional(),
});

export const InvestmentInstrumentListResponseSchema = z.array(
  InvestmentInstrumentResponseSchema,
);

export type InvestmentInstrumentDTO = z.infer<typeof InvestmentInstrumentSchema>;
export type InvestmentInstrumentUpdateDTO = z.infer<
  typeof InvestmentInstrumentUpdateSchema
>;
export type InvestmentInstrumentFilterQuery = z.infer<
  typeof InvestmentInstrumentFilterQuerySchema
>;
export type InvestmentInstrumentResponseDTO = z.infer<
  typeof InvestmentInstrumentResponseSchema
>;
export type InvestmentInstrumentListResponseDTO = z.infer<
  typeof InvestmentInstrumentListResponseSchema
>;

z.globalRegistry.add(InvestmentInstrumentSchema, { id: 'InvestmentInstrument' });
z.globalRegistry.add(InvestmentInstrumentUpdateSchema, {
  id: 'InvestmentInstrumentUpdate',
});
z.globalRegistry.add(InvestmentInstrumentResponseSchema, {
  id: 'InvestmentInstrumentResponse',
});
z.globalRegistry.add(InvestmentInstrumentListResponseSchema, {
  id: 'InvestmentInstrumentListResponse',
});
