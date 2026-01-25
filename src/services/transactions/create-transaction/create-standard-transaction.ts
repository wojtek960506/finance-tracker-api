import { getNextSourceIndex } from "@services/transactions";
import { persistTransaction } from "@db/transactions/persist-transaction";
import { TransactionResponseDTO, TransactionStandardDTO } from "@schemas/transaction";


export const createStandardTransaction = async (
  dto: TransactionStandardDTO,
  ownerId: string,
): Promise<TransactionResponseDTO> => {
  const sourceIndex = await getNextSourceIndex(ownerId);  
  const newTransaction = await persistTransaction({
    ...dto,
    ownerId,
    sourceIndex,
  });
  return newTransaction;
}