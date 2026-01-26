
import { TransactionCreateTransferDTO } from "@schemas/transaction";
import { TransferTransactionProps } from "@db/transactions/persist-transaction";


export const prepareTransferProps = (
  body: TransactionCreateTransferDTO,
  ownerId: string,
  sourceIndexExpense: number,
  sourceIndexIncome: number,
) => {

  // TODO for now `accountExpense` and `accountIncome` are not translated in the body,
  // so decide how to handle it
  let description = `${body.accountExpense} --> ${body.accountIncome}`;
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
  
  const expenseTransactionProps: TransferTransactionProps = {
    ...commonTransactionProps,
    transactionType: "expense",
    account: body.accountExpense,
    sourceIndex: sourceIndexExpense,
    sourceRefIndex: sourceIndexIncome,
  };

  const incomeTransactionProps: TransferTransactionProps = {
    ...commonTransactionProps,
    transactionType: "income",
    account: body.accountIncome,
    sourceIndex: sourceIndexIncome,
    sourceRefIndex: sourceIndexExpense,
  };

  return { expenseTransactionProps, incomeTransactionProps };
}