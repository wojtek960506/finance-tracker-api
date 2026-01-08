import { TransactionModel } from "@models/transaction-model";
import { getNextSourceIndex } from "../get-next-source-index";
import { TransactionCreateStandardDTO } from "@schemas/transaction";
import { serializeTransaction } from "@schemas/serialize-transaction";


export async function createStandardTransaction(
  dto: TransactionCreateStandardDTO,
  ownerId: string,
) {  
  const sourceIndex = await getNextSourceIndex(ownerId);
  const newTransaction = await TransactionModel.create({
    ...dto,
    sourceIndex,
    ownerId
  });
  return serializeTransaction(newTransaction);
}