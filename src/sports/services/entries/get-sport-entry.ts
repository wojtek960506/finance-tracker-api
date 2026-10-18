import { INamedResource } from '@named-resource';
import { checkOwner } from '@shared/services';
import { SportEntryNotFoundError } from '@utils/errors';

import { SportEntryModel } from '../../model';
import { SportEntryResponseDTO } from '../../schema';
import { serializeSportEntry } from '../../serializers';

export const getSportEntry = async (
  ownerId: string,
  entryId: string,
): Promise<SportEntryResponseDTO> => {
  const entry = await SportEntryModel.findById(entryId).populate<{
    categoryId: INamedResource;
  }>('categoryId');

  if (!entry) {
    throw new SportEntryNotFoundError(entryId);
  }

  checkOwner(ownerId, entry._id.toString(), entry.ownerId, 'sportEntry');

  return serializeSportEntry(entry);
};
