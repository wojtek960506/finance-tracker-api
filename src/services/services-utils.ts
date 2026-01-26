import { TransactionOwnershipError } from "@utils/errors"


export const checkTransactionOwner = (
  userId: string,
  transactionId: string,
  transactionOwnerId: string,
) => {
  if (userId !== transactionOwnerId)
    throw new TransactionOwnershipError(userId, transactionId, transactionOwnerId);
}