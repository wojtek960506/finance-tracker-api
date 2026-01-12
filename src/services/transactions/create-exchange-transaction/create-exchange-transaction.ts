import { createTransactionPair } from "@services/transactions";
import { TransactionCreateStandardDTO } from "@schemas/transaction";


export type ExchangeTransactionProps = TransactionCreateStandardDTO & {
  ownerId: string,
  currencies: string,
  exchangeRate: number,
  sourceIndex: number,
  sourceRefIndex: number
};

export async function createExchangeTransaction (
  expenseTransactionProps: ExchangeTransactionProps,
  incomeTransactionProps: ExchangeTransactionProps,
) {
  const result = await createTransactionPair(
    expenseTransactionProps,
    incomeTransactionProps,
  );
  return result;
}