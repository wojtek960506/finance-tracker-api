import { checkOwner, CheckOwnerType } from '@shared/services';

import { NamedResourceMinimal } from './types';

export const getNamedResource = <
  TResource extends NamedResourceMinimal,
  TResponse,
>(deps: {
  findById: (id: string) => Promise<TResource>;
  serialize: (resource: TResource) => TResponse;
  checkOwnerType: CheckOwnerType;
}) => {
  return async (resourceId: string, ownerId: string): Promise<TResponse> => {
    const resource = await deps.findById(resourceId);
    if (resource.type !== 'system')
      checkOwner(ownerId, resourceId, resource.ownerId!, deps.checkOwnerType);
    return deps.serialize(resource);
  };
};
