import {
  getNamedResourceKindConfig,
  NamedResourceKind,
  NamedResourceResponse,
} from '../kind-config';
import { INamedResource } from '../model';

import {
  findNamedResourceById as findNamedResourceByIdWithModel,
  findNamedResourceByName as findNamedResourceByNameWithModel,
  findNamedResources as findNamedResourcesWithModel,
} from './find';
import { removeNamedResourceById as removeNamedResourceByIdWithModel } from './remove';
import {
  NamedResourceCreateProps,
  NamedResourceMinimal,
  NamedResourceUpdateProps,
} from './types';
import {
  persistNamedResource as persistNamedResourceWithModel,
  saveNamedResourceChanges as saveNamedResourceChangesWithSerializer,
} from './write';

export const findNamedResourceById = async (
  kind: NamedResourceKind,
  id: string,
) => {
  const config = getNamedResourceKindConfig(kind);
  return findNamedResourceByIdWithModel(
    config.model as any,
    id,
    config.notFoundErrorFactory,
  ) as Promise<INamedResource>;
};

export const findNamedResourceByName = async (
  kind: NamedResourceKind,
  name: string,
  ownerId?: string,
) => {
  const config = getNamedResourceKindConfig(kind);
  return findNamedResourceByNameWithModel(
    config.model as any,
    name,
    ownerId,
  ) as Promise<INamedResource | null>;
};

export const findNamedResources = async (
  kind: NamedResourceKind,
  ownerId?: string,
  resourceIds?: string[],
) => {
  const config = getNamedResourceKindConfig(kind);
  return findNamedResourcesWithModel(
    config.model as any,
    ownerId,
    resourceIds,
  ) as Promise<INamedResource[]>;
};

export const persistNamedResource = async <
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  props: NamedResourceCreateProps,
) => {
  const config = getNamedResourceKindConfig(kind);
  return persistNamedResourceWithModel<NamedResourceMinimal, TResponse>(
    config.model as any,
    props,
    config.serialize as (resource: NamedResourceMinimal) => TResponse,
  );
};

export const saveNamedResourceChanges = async <
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  resource: INamedResource,
  newProps: NamedResourceUpdateProps,
) => {
  const config = getNamedResourceKindConfig(kind);
  return saveNamedResourceChangesWithSerializer<INamedResource, TResponse>(
    resource,
    newProps,
    config.serialize as (resource: INamedResource) => TResponse,
  );
};

export const removeNamedResourceById = async (
  kind: NamedResourceKind,
  id: string,
) => {
  const config = getNamedResourceKindConfig(kind);
  return removeNamedResourceByIdWithModel(
    config.model as any,
    id,
    config.notFoundErrorFactory,
  );
};

export * from './types';
