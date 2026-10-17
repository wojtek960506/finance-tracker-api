import { checkOwner } from '@shared/services';
import { SportEntryNotFoundError } from '@utils/errors';

import { SportEntryModel } from '../../model';

export const deleteSportEntry = async (
  ownerId: string,
  entryId: string,
): Promise<void> => {
  const entry = await SportEntryModel.findById(entryId);

  if (!entry) {
    throw new SportEntryNotFoundError(entryId);
  }

  checkOwner(ownerId, entry._id.toString(), entry.ownerId, 'sportEntry');

  await entry.deleteOne();
};
