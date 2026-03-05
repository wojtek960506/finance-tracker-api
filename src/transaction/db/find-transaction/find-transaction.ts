import { TransactionNotFoundError } from "@utils/errors";
import { TransactionModel } from "@transaction/model";


export const findTransaction = async (id: string) => {
  const transaction = await TransactionModel.findById(id);
  if (!transaction) throw new TransactionNotFoundError(id);
  return transaction;
}
