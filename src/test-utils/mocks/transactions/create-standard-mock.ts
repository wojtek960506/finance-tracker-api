import { TransactionStandardDTO } from "@schemas/transaction";

const date = new Date("2025-01-12");
const amount = 88;
const currency = "PLN";
const category = "food";
const account = "mBank";
const paymentMethod = "card";
const description = "some transaction";
const transactionType = "expense";

export const OLD_getTransactionStandardDTO = () => ({
  date,
  amount,
  currency,
  category,
  account,
  paymentMethod,
  description,
  transactionType,
} as TransactionStandardDTO);

export const OLD_getStandardTransactionProps = (ownerId: string, sourceIndex: number) => ({
  ...OLD_getTransactionStandardDTO(),
  ownerId,
  sourceIndex,
})

export const OLD_getStandardTransactionResultJSON = (
  ownerId: string,
  sourceIndex: number,
  transactionId: string,
) => {
  const props = OLD_getStandardTransactionProps(ownerId, sourceIndex);
  return {
    ...props,
    id: transactionId,
    date: props.date.toISOString(),
  }
}