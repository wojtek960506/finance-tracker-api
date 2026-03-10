import { DeleteResult } from 'mongoose';

import { NamedResourceMinimal } from '@shared/named-resource';
import { checkOwner, CheckOwnerType } from '@shared/services';

export const deleteNamedResource = <TResource extends NamedResourceMinimal>(deps: {
  findById: (id: string) => Promise<TResource>;
  remove: (id: string) => Promise<DeleteResult>;
  checkOwnerType: CheckOwnerType;
  checkOccurrences: (id: string) => Promise<void>;
  systemResourceDeleteErrorFactory: (id: string) => Error;
}) => {
  return async (resourceId: string, ownerId: string): Promise<DeleteResult> => {
    const resource = await deps.findById(resourceId);
    if (resource.type === 'system')
      throw deps.systemResourceDeleteErrorFactory(resourceId);
    checkOwner(ownerId, resourceId, resource.ownerId!, deps.checkOwnerType);

    await deps.checkOccurrences(resourceId);

    return deps.remove(resourceId);
  };
};
