import { ExchangeTransactionProps } from "./types";
import { persistTransactionPair } from "./persist-transaction-pair";


export async function persistExchangeTransaction (
  expenseTransactionProps: ExchangeTransactionProps,
  incomeTransactionProps: ExchangeTransactionProps,
) {
  const result = await persistTransactionPair(
    expenseTransactionProps,
    incomeTransactionProps,
  );
  return result;
}