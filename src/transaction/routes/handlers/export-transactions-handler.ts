import { stringify } from 'csv-stringify';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prepareNamedResourcesMap } from '@named-resource/services';
import { AuthenticatedRequest } from '@shared/http';
import { findTransactionResourceIds, streamTransactions } from '@transaction/db';
import { TransactionQuery } from '@transaction/schema';
import {
  buildTransactionFilterQuery,
  csvExportColumns,
  transactionToCsvRow,
} from '@transaction/services';

export async function exportTransacionsHandler(req: FastifyRequest, res: FastifyReply) {
  const userId = (req as AuthenticatedRequest).userId;
  const filter = buildTransactionFilterQuery(req.query as TransactionQuery, userId);
  const cursor = streamTransactions(filter);
  const { accountIds, categoryIds, paymentMethodIds } =
    await findTransactionResourceIds(filter);
  const [accountsMap, categoriesMap, paymentMethodsMap] = await Promise.all([
    prepareNamedResourcesMap('account', userId, accountIds),
    prepareNamedResourcesMap('category', userId, categoryIds),
    prepareNamedResourcesMap('paymentMethod', userId, paymentMethodIds),
  ]);

  // Set headers before streaming the CSV body.
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `transactions-backup-${timestamp}.csv`;
  res
    .header('Content-Type', 'text/csv')
    .header('Content-Disposition', `attachment; filename="${filename}"`);

  // Create the CSV stream.
  const csvStream = stringify({ header: true, columns: csvExportColumns });

  // Hand the stream to Fastify.
  res.send(csvStream);

  // Stream matching transactions into CSV.
  for await (const transaction of cursor) {
    csvStream.write(
      transactionToCsvRow(transaction, categoriesMap, paymentMethodsMap, accountsMap),
    );
  }

  // Close the CSV stream when finished.
  csvStream.end();
}
