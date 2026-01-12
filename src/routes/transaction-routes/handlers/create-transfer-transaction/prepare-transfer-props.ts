import { TransactionCreateTransferDTO } from "@schemas/transaction";
import { TransferTransactionProps } from "@services/transactions/create-transfer-transaction/create-transfer-transaction";

export const prepareTransferProps = (
  body: TransactionCreateTransferDTO,
  ownerId: string,
  fromIndexExpense: number,
  toIndexExpense: number,
) => {

  // TODO for now `accountFrom` and `accountTo` are not translated in the body so
  // decide how to handle it
  let description = `${body.accountFrom} --> ${body.accountTo}`;
  if (body.additionalDescription) description += ` (${body.additionalDescription})`;


  const commonTransactionProps = {
      category: "myAccount",
      ownerId,
      date: body.date,
      amount: body.amount,
      currency: body.currency,
      paymentMethod: body.paymentMethod,
      description,
    }
  
  const fromTransactionProps: TransferTransactionProps = {
    ...commonTransactionProps,
    transactionType: "expense",
    account: body.accountFrom,
    sourceIndex: fromIndexExpense,
    sourceRefIndex: toIndexExpense,
  };

  const toTransactionProps: TransferTransactionProps = {
    ...commonTransactionProps,
    transactionType: "income",
    account: body.accountTo,
    sourceIndex: toIndexExpense,
    sourceRefIndex: fromIndexExpense,
  };

  return { fromTransactionProps, toTransactionProps };
}