import { findNamedResourceById } from '@named-resource/db';
import {
  getNamedResourceKindConfig,
  NamedResourceResponse,
} from '@named-resource/kind-config';
import { NamedResourceKind } from '@named-resource/types';
import { isFavoriteNamedResource } from '@named-resource-favorite/db';
import { checkOwner } from '@shared/services';

export const getNamedResource = async <
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  resourceId: string,
  ownerId: string,
): Promise<TResponse> => {
  const config = getNamedResourceKindConfig(kind);
  const resource = await findNamedResourceById(kind, resourceId);

  if (resource.type !== 'system')
    checkOwner(ownerId, resourceId, resource.ownerId!, config.checkOwnerType);

  return {
    ...(config.serialize(resource) as TResponse),
    isFavorite: await isFavoriteNamedResource(ownerId, kind, resourceId),
  };
};
