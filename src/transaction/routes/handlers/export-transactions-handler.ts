import { stringify } from 'csv-stringify';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prepareAccountsMap } from '@account/services';
import { prepareCategoriesMap } from '@category/services';
import { preparePaymentMethodsMap } from '@payment-method/services';
import { AuthenticatedRequest } from '@shared/http';
import { streamTransactions } from '@transaction/db';
import { csvExportColumns, transactionToCsvRow } from '@transaction/services';

export async function exportTransacionsHandler(req: FastifyRequest, res: FastifyReply) {
  // 1. Set headers first
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `transactions-backup-${timestamp}.csv`;
  res
    .header('Content-Type', 'text/csv')
    .header('Content-Disposition', `attachment; filename="${filename}"`);

  // 2. Create CSV stream
  const csvStream = stringify({ header: true, columns: csvExportColumns });

  // 3. Send stream to client
  res.send(csvStream);

  // 4. Stream DB records into CSV
  const userId = (req as AuthenticatedRequest).userId;
  const cursor = streamTransactions(userId);
  const [accountsMap, categoriesMap, paymentMethodsMap] = await Promise.all([
    prepareAccountsMap(userId),
    prepareCategoriesMap(userId),
    preparePaymentMethodsMap(userId),
  ]);

  for await (const transaction of cursor) {
    csvStream.write(
      transactionToCsvRow(transaction, categoriesMap, paymentMethodsMap, accountsMap),
    );
  }

  // 5. End CSV stream
  csvStream.end();
}
