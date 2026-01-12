import { TransactionCreateStandardDTO } from "@schemas/transaction";

const date = new Date("2025-01-12");
const amount = 88;
const currency = "PLN";
const account = "mBank";
const paymentMethod = "card";
const description = "some transaction";
const transactionType = "expense";

export const getTransactionCreateStandardDTO = () => ({
  date,
  amount,
  currency,
  account,
  paymentMethod,
  description,
  transactionType,
} as TransactionCreateStandardDTO);

export const getStandardTransactionProps = (ownerId: string, sourceIndex: number) => ({
  ...getTransactionCreateStandardDTO(),
  ownerId,
  sourceIndex,
})