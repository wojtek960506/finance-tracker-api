import { DeleteResult } from 'mongoose';

import {
  findNamedResourceById,
  removeNamedResourceById,
} from '@shared/named-resource/db';
import {
  getNamedResourceKindConfig,
  NamedResourceKind,
} from '@shared/named-resource/kind-config';
import { checkOwner } from '@shared/services';

export const deleteNamedResource = async (
  kind: NamedResourceKind,
  resourceId: string,
  ownerId: string,
): Promise<DeleteResult> => {
  const config = getNamedResourceKindConfig(kind);
  const resource = await findNamedResourceById(kind, resourceId);

  if (resource.type === 'system')
    throw config.systemResourceDeleteErrorFactory(resourceId);

  checkOwner(ownerId, resourceId, resource.ownerId!, config.checkOwnerType);
  await config.checkOccurrences(resourceId);

  return removeNamedResourceById(kind, resourceId);
};
