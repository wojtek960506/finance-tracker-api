import { findFavoriteNamedResourceIds } from '@named-resource-favorite/db';
import { findNamedResources } from '@shared/named-resource/db';
import {
  getNamedResourceKindConfig,
  NamedResourceResponse,
} from '@shared/named-resource/kind-config';
import { NamedResourceKind } from '@shared/named-resource/types';

export const listNamedResources = async <
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  ownerId: string,
): Promise<TResponse[]> => {
  const config = getNamedResourceKindConfig(kind);
  const [resources, favoriteIds] = await Promise.all([
    findNamedResources(kind, ownerId),
    findFavoriteNamedResourceIds(ownerId, kind),
  ]);
  const favoriteIdSet = new Set(favoriteIds);

  return resources.map((resource) => {
    const serialized = config.serialize(resource) as TResponse;

    return {
      ...serialized,
      isFavorite: favoriteIdSet.has(serialized.id),
    };
  });
};
