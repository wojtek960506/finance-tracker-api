import {
  persistTransactionPair,
  ExchangeTransactionProps,
} from "@db/transactions/persist-transaction";


export async function createExchangeTransaction (
  expenseTransactionProps: ExchangeTransactionProps,
  incomeTransactionProps: ExchangeTransactionProps,
) {
  const result = await persistTransactionPair(
    expenseTransactionProps,
    incomeTransactionProps,
  );
  return result;
}