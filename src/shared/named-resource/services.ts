import { Types } from 'mongoose';

import { checkOwner, CheckOwnerType } from '@shared/services';
import { normalizeWhitespace } from '@utils/strings';

type NamedResourceMinimal = {
  type: 'user' | 'system';
  ownerId?: string | Types.ObjectId;
};

type NameDTO = { name: string };

export const createNamedResource = <TDTO extends NameDTO, TResponse>(deps: {
  findByName: (name: string, ownerId: string) => Promise<unknown>;
  persist: (props: {
    ownerId: string;
    type: 'user' | 'system';
    name: string;
    nameNormalized: string;
  }) => Promise<TResponse>;
  alreadyExistsErrorFactory: (name: string) => Error;
}) => {
  return async (ownerId: string, dto: TDTO): Promise<TResponse> => {
    const { name } = dto;

    const resource = await deps.findByName(name, ownerId);
    if (resource) throw deps.alreadyExistsErrorFactory(name);

    const normalizedName = normalizeWhitespace(name);
    return deps.persist({
      ownerId,
      type: 'user',
      name: normalizedName,
      nameNormalized: normalizedName.toLowerCase(),
    });
  };
};

export const getNamedResource = <
  TResource extends NamedResourceMinimal,
  TResponse,
>(deps: {
  findById: (id: string) => Promise<TResource>;
  serialize: (resource: TResource) => TResponse;
  ownerType: CheckOwnerType;
}) => {
  return async (resourceId: string, ownerId: string): Promise<TResponse> => {
    const resource = await deps.findById(resourceId);
    if (resource.type !== 'system')
      checkOwner(ownerId, resourceId, resource.ownerId!, deps.ownerType);
    return deps.serialize(resource);
  };
};

export const updateNamedResource = <
  TResource extends NamedResourceMinimal,
  TResponse,
>(deps: {
  findById: (id: string) => Promise<TResource>;
  saveChanges: (
    resource: TResource,
    props: { name: string; nameNormalized: string },
  ) => Promise<TResponse>;
  ownerType: CheckOwnerType;
  systemUpdateNotAllowedFactory: (id: string) => Error;
  userMissingOwnerFactory: (id: string) => Error;
}) => {
  return async (
    resourceId: string,
    ownerId: string,
    dto: NameDTO,
  ): Promise<TResponse> => {
    const resource = await deps.findById(resourceId);
    if (resource.type === 'system') throw deps.systemUpdateNotAllowedFactory(resourceId);
    if (!resource.ownerId) throw deps.userMissingOwnerFactory(resourceId);
    checkOwner(ownerId, resourceId, resource.ownerId, deps.ownerType);

    const normalizedName = normalizeWhitespace(dto.name);
    return deps.saveChanges(resource, {
      name: normalizedName,
      nameNormalized: normalizedName.toLowerCase(),
    });
  };
};

export const getOrCreateNamedResource = <
  TResource,
  TResponse extends { name: string },
>(deps: {
  findByName: (name: string, ownerId: string) => Promise<TResource | null>;
  serialize: (resource: TResource) => TResponse;
  create: (ownerId: string, dto: { name: string }) => Promise<TResponse>;
}) => {
  return async (ownerId: string, name: string) => {
    const resource = await deps.findByName(name, ownerId);
    if (resource) return deps.serialize(resource);
    return deps.create(ownerId, { name });
  };
};

export const prepareNamedResourcesMap = <
  TResource extends {
    _id: { toString: () => string };
    type: 'user' | 'system';
    name: string;
  },
>(
  resources: TResource[],
) => {
  return Object.fromEntries(
    resources.map((resource) => [
      resource._id.toString(),
      {
        id: resource._id.toString(),
        type: resource.type,
        name: resource.name,
      },
    ]),
  );
};
