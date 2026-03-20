import { FastifyInstance } from 'fastify';

import { authorizeAccessToken } from '@auth/services';
import { currencies } from '@currency/consts';
import { CurrenciesSchema, Currency } from '@currency/schema';

export async function currencyRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{ Reply: Currency[] }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Currencies'],
        summary: 'List currencies',
        description: 'Return list of currencies with their codes and names.',
        response: { 200: CurrenciesSchema },
      },
    },
    async (_, res) => res.code(200).send(currencies.map((c) => ({ ...c }))),
  );
}
