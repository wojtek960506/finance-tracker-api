import { TransactionModel } from "@models/transaction-model";
import { TransactionCreateStandardDTO } from "@schemas/transaction";
import { serializeTransaction } from "@schemas/serialize-transaction";


export async function createStandardTransaction(
  dto: TransactionCreateStandardDTO,
  ownerId: string,
  sourceIndex: number,
) {
  const newTransaction = await TransactionModel.create({
    ...dto,
    sourceIndex,
    ownerId,
  });
  return serializeTransaction(newTransaction);
}