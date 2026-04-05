import {
  favoriteNamedResource as favoriteNamedResourceHandler,
  findFavoriteNamedResourceIds,
  getFavoriteNamedResources as getFavoriteNamedResourcesHandler,
  persistFavoriteNamedResource,
  removeFavoriteNamedResource,
  unfavoriteNamedResource as unfavoriteNamedResourceHandler,
} from '@shared/named-resource-favorite';

import {
  findNamedResourceById,
  findNamedResources,
} from '../db';
import {
  getNamedResourceKindConfig,
  NamedResourceKind,
  NamedResourceResponse,
} from '../kind-config';
import { INamedResource } from '../model';

export * from './create';
export * from './delete';
export * from './get';
export * from './get-or-create';
export * from './prepare-map';
export * from './update';

export const listNamedResources = async <
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  ownerId: string,
): Promise<TResponse[]> => {
  const config = getNamedResourceKindConfig(kind);
  const resources = await findNamedResources(kind, ownerId);
  return resources.map((resource) => config.serialize(resource) as TResponse);
};

export const getFavoriteNamedResources = async <
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  ownerId: string,
): Promise<TResponse[]> => {
  const config = getNamedResourceKindConfig(kind);

  return getFavoriteNamedResourcesHandler<INamedResource, TResponse>({
    resourceType: kind,
    findFavoriteIds: findFavoriteNamedResourceIds,
    findResources: (resourceOwnerId, resourceIds) =>
      findNamedResources(kind, resourceOwnerId, resourceIds),
    serialize: config.serialize as (resource: INamedResource) => TResponse,
  })(ownerId);
};

export const favoriteNamedResource = async <
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  resourceId: string,
  ownerId: string,
): Promise<TResponse> => {
  const config = getNamedResourceKindConfig(kind);

  return favoriteNamedResourceHandler<INamedResource, TResponse>({
    resourceType: kind,
    findById: (id) => findNamedResourceById(kind, id),
    persistFavorite: persistFavoriteNamedResource,
    serialize: config.serialize as (resource: INamedResource) => TResponse,
    checkOwnerType: config.checkOwnerType,
  })(resourceId, ownerId);
};

export const unfavoriteNamedResource = async (
  kind: NamedResourceKind,
  resourceId: string,
  ownerId: string,
) => {
  const config = getNamedResourceKindConfig(kind);

  return unfavoriteNamedResourceHandler<INamedResource>({
    resourceType: kind,
    findById: (id) => findNamedResourceById(kind, id),
    removeFavorite: removeFavoriteNamedResource,
    checkOwnerType: config.checkOwnerType,
  })(resourceId, ownerId);
};
