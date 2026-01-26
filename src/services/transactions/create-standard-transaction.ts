import { getNextSourceIndex } from "./get-next-source-index";
import { persistStandardTransaction } from "@db/transactions/persist-transaction";
import {
  TransactionResponseDTO,
  TransactionCreateStandardDTO,
} from "@schemas/transaction";


export const createStandardTransaction = async (
  dto: TransactionCreateStandardDTO,
  ownerId: string,
): Promise<TransactionResponseDTO> => {
  const sourceIndex = await getNextSourceIndex(ownerId);  
  const newTransaction = await persistStandardTransaction({
    ...dto,
    ownerId,
    sourceIndex,
  });
  return newTransaction;
}