import { AuthenticatedRequest } from "@routes/routes-types";
import { FastifyReply, FastifyRequest } from "fastify";
import { stringify } from 'csv-stringify';
import { TransactionModel } from "@models/transaction-model";

export async function exportTransacionsHandler (
  req: FastifyRequest, res: FastifyReply
) {
  // 1. Set headers first
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  res
    .header('Content-Type', 'text/csv')
    // think about adding date and time in the title
    .header(
      'Content-Disposition',
      `attachment; filename="transactions-backup-${timestamp}.csv"`
    );

  // 2. Create CSV stream
  const csvStream = stringify({
    header: true,
    columns: [
      { key: 'idx', header: 'idx' },
      { key: 'date', header: 'date' },
      { key: 'description', header: 'description' },
      { key: 'amount', header: 'amount' },
      { key: 'currency', header: 'currency' },
      { key: 'category', header: 'category' },
      { key: 'paymentMethod', header: 'paymentMethod' },
      { key: 'account', header: 'account' },
      { key: 'exchangeRate', header: 'exchangeRate' },
      { key: 'currencies', header: 'currencies' },
      { key: 'calcRefIdx', header: 'calcRefIdx' },
      { key: 'transactionType', header: 'transactionType' },
    ]
  })

  // 3. Send stream to client
  res.send(csvStream);

  // 4. Stream DB records into CSV
  const cursor = TransactionModel.find({ ownerId: (req as AuthenticatedRequest).userId })
    .sort({ date: 1 })
    .cursor();

  for await (const tx of cursor) {
    csvStream.write({
      idx: tx.idx,
      date: tx.date.toISOString().slice(0,10),
      description: tx.description,
      amount: tx.amount,
      currency: tx.currency,
      category: tx.category,
      paymentMethod: tx.paymentMethod,
      account: tx.account,
      exchangeRate: tx.exchangeRate,
      currencies: tx.currencies,
      calcRefIdx: tx.calcRefIdx,
      transactionType: tx.transactionType,
    });
  }

  // 5. End CSV stream
  csvStream.end();
}