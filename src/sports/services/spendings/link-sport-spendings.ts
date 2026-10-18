import { TransactionModel } from '@transaction/model';
import { SportEntryNotFoundError, TransactionNotFoundError } from '@utils/errors';

import { SportEntryModel } from '../../model';
import {
  LinkSportSpendingsToTransactionDTO,
  SportSpendingLinkResponseDTO,
} from '../../schema';

export const linkSportSpendingsToTransaction = async (
  ownerId: string,
  dto: LinkSportSpendingsToTransactionDTO,
): Promise<SportSpendingLinkResponseDTO> => {
  const transaction = await TransactionModel.findOne({
    _id: dto.transactionId,
    ownerId,
  });

  if (!transaction) {
    throw new TransactionNotFoundError(dto.transactionId);
  }

  // 1. Verify existence and ownership of all sport entries before updating
  const entries = await SportEntryModel.find({
    _id: { $in: dto.entryIds },
    ownerId,
  });

  if (entries.length !== dto.entryIds.length) {
    const foundIds = new Set(entries.map((e) => e._id.toString()));
    const missingId = dto.entryIds.find((id) => !foundIds.has(id));
    throw new SportEntryNotFoundError(missingId ?? dto.entryIds[0]);
  }

  // 2. Execute update
  const result = await SportEntryModel.updateMany(
    { _id: { $in: dto.entryIds }, ownerId },
    { $set: { transactionId: dto.transactionId } },
  );

  return {
    acknowledged: result.acknowledged,
    modifiedCount: result.modifiedCount,
  };
};
