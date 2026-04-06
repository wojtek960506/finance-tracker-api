import {
  getNamedResourceKindConfig,
  NamedResourceResponse,
} from '@named-resource/kind-config';
import { NamedResourceKind } from '@named-resource/types';
import { persistFavoriteNamedResource } from '@named-resource-favorite/db';

import { assertNamedResourceAccess } from './assert-named-resource-access';

export const favoriteNamedResource = async <
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  resourceId: string,
  ownerId: string,
): Promise<TResponse> => {
  const config = getNamedResourceKindConfig(kind);
  const resource = await assertNamedResourceAccess(kind, resourceId, ownerId);

  await persistFavoriteNamedResource(ownerId, kind, resourceId);
  return {
    ...(config.serialize(resource) as TResponse),
    isFavorite: true,
  };
};
