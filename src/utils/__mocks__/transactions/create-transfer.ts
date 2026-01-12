import { TransactionCreateTransferDTO } from "@schemas/transaction";
import { TransferTransactionProps } from "@services/transactions";

const date = new Date("2026-01-09");
const amount = 77;
const currency = "PLN";
const accountFrom = "mBank";
const accountTo = "veloBank";
const paymentMethod = "bankTransfer";
const additionalDescription = "savings";

export const getTransactionCreateTransactionDTO = () => ({
  date,
  amount,
  currency,
  accountFrom,
  accountTo,
  paymentMethod,
  additionalDescription,
} as TransactionCreateTransferDTO);

export const getTransferTransactionProps = (
  ownerId: string,
  fromIdx: number,
  toIdx: number,
) => {
  const commonProps = {
    category: "myAccount",
    ownerId,
    date,
    amount,
    currency,
    paymentMethod,
    description: `${accountFrom} --> ${accountTo} (${additionalDescription})`,
  }

  const fromProps: TransferTransactionProps = {
    ...commonProps,
    transactionType: "expense",
    account: accountFrom,
    sourceIndex: fromIdx,
    sourceRefIndex: toIdx
  }

  const toProps: TransferTransactionProps = {
    ...commonProps,
    transactionType: "income",
    account: accountTo,
    sourceIndex: toIdx,
    sourceRefIndex: fromIdx,
  }

  return { fromProps, toProps };
}