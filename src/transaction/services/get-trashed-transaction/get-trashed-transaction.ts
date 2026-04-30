import { TrashedTransactionDetailsResponseDTO } from '@transaction/schema';
import { serializeTrashedTransaction } from '@transaction/serializers';
import { loadOwnedTransactionDetails } from '@transaction/services/get-transaction';

export const getTrashedTransaction = async (
  transactionId: string,
  userId: string,
): Promise<TrashedTransactionDetailsResponseDTO> => {
  const { transaction, reference } = await loadOwnedTransactionDetails(
    transactionId,
    userId,
    { deletionState: 'trash' },
  );

  const serialized = serializeTrashedTransaction(transaction);

  if (!reference) return serialized;

  return {
    ...serialized,
    reference: serializeTrashedTransaction(reference),
  };
};
