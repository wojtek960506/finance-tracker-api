import { z } from 'zod/v4';

import { currencies } from '@currency/consts';

export type CurrencyCode = (typeof currencies)[number]['code'];

export type Currency = { code: CurrencyCode; name: string };

export const CURRENCY_CODES = currencies.map((c) => c.code) as [
  CurrencyCode,
  ...CurrencyCode[],
];

if (CURRENCY_CODES.length === 0) throw new Error('Currencies list cannot be empty');

export const CurrencyCodeSchema = z.enum(CURRENCY_CODES);

export const CurrencySchema = z.object({
  code: CurrencyCodeSchema,
  name: z.string(),
});

export const CurrenciesSchema = z.array(CurrencySchema);
