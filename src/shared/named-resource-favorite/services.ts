import { DeleteResult } from 'mongoose';

import { NamedResourceMinimal } from '@shared/named-resource';
import { checkOwner, CheckOwnerType } from '@shared/services';

import { FavoriteNamedResourceType } from './types';

const assertNamedResourceAccess = async <TResource extends NamedResourceMinimal>(
  resourceId: string,
  ownerId: string,
  deps: {
    findById: (id: string) => Promise<TResource>;
    checkOwnerType: CheckOwnerType;
  },
) => {
  const resource = await deps.findById(resourceId);
  if (resource.type !== 'system')
    checkOwner(ownerId, resourceId, resource.ownerId!, deps.checkOwnerType);
  return resource;
};

export const getFavoriteNamedResources = <
  TResource extends NamedResourceMinimal,
  TResponse,
>(deps: {
  resourceType: FavoriteNamedResourceType;
  findFavoriteIds: (
    userId: string,
    resourceType: FavoriteNamedResourceType,
  ) => Promise<string[]>;
  findResources: (ownerId?: string, resourceIds?: string[]) => Promise<TResource[]>;
  serialize: (resource: TResource) => TResponse;
}) => {
  return async (ownerId: string): Promise<TResponse[]> => {
    const favoriteIds = await deps.findFavoriteIds(ownerId, deps.resourceType);
    if (!favoriteIds.length) return [];

    const resources = await deps.findResources(ownerId, favoriteIds);
    return resources.map((resource) => deps.serialize(resource));
  };
};

export const favoriteNamedResource = <
  TResource extends NamedResourceMinimal,
  TResponse,
>(deps: {
  resourceType: FavoriteNamedResourceType;
  findById: (id: string) => Promise<TResource>;
  persistFavorite: (
    userId: string,
    resourceType: FavoriteNamedResourceType,
    resourceId: string,
  ) => Promise<unknown>;
  serialize: (resource: TResource) => TResponse;
  checkOwnerType: CheckOwnerType;
}) => {
  return async (resourceId: string, ownerId: string): Promise<TResponse> => {
    const resource = await assertNamedResourceAccess(resourceId, ownerId, deps);
    await deps.persistFavorite(ownerId, deps.resourceType, resourceId);
    return deps.serialize(resource);
  };
};

export const unfavoriteNamedResource = <TResource extends NamedResourceMinimal>(deps: {
  resourceType: FavoriteNamedResourceType;
  findById: (id: string) => Promise<TResource>;
  removeFavorite: (
    userId: string,
    resourceType: FavoriteNamedResourceType,
    resourceId: string,
  ) => Promise<DeleteResult>;
  checkOwnerType: CheckOwnerType;
}) => {
  return async (resourceId: string, ownerId: string): Promise<DeleteResult> => {
    await assertNamedResourceAccess(resourceId, ownerId, deps);
    return deps.removeFavorite(ownerId, deps.resourceType, resourceId);
  };
};
