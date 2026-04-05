import { findFavoriteNamedResourceIds } from '@named-resource-favorite/db';

import { findNamedResources } from '@shared/named-resource/db';
import {
  getNamedResourceKindConfig,
  NamedResourceResponse,
} from '@shared/named-resource/kind-config';
import { NamedResourceKind } from '@shared/named-resource/types';

export const getFavoriteNamedResources = async <
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  ownerId: string,
): Promise<TResponse[]> => {
  const config = getNamedResourceKindConfig(kind);
  const favoriteIds = await findFavoriteNamedResourceIds(ownerId, kind);
  if (!favoriteIds.length) return [];

  const resources = await findNamedResources(kind, ownerId, favoriteIds);
  return resources.map((resource) => config.serialize(resource) as TResponse);
};
