import { TransactionModel } from "@transaction/model"
import { TransactionNotFoundError } from "@utils/errors"


export const findTransaction = async (id: string) => {
  const transaction = await TransactionModel.findById(id);
  if (!transaction) throw new TransactionNotFoundError(id);
  return transaction;
}
