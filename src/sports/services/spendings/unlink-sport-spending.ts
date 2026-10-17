import { SportEntryNotFoundError } from '@utils/errors';

import { SportEntryModel } from '../../model';
import {
  SportSpendingLinkResponseDTO,
  UnlinkSportSpendingFromTransactionDTO,
} from '../../schema';

export const unlinkSportSpendingFromTransaction = async (
  ownerId: string,
  dto: UnlinkSportSpendingFromTransactionDTO,
): Promise<SportSpendingLinkResponseDTO> => {
  const entry = await SportEntryModel.findOne({
    _id: dto.entryId,
    ownerId,
  });

  if (!entry) {
    throw new SportEntryNotFoundError(dto.entryId);
  }

  entry.transactionId = null;
  await entry.save();

  return {
    acknowledged: true,
    modifiedCount: 1,
  };
};
