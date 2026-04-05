import { getNamedResourceKindConfig } from '@shared/named-resource/kind-config';
import { INamedResource } from '@shared/named-resource/model';
import { NamedResourceKind } from '@shared/named-resource/types';
import { normalizeWhitespace } from '@utils/strings';

export const findNamedResourceById = async (kind: NamedResourceKind, id: string) => {
  const config = getNamedResourceKindConfig(kind);

  const resource = await config.model.findById(id);
  if (!resource) throw config.notFoundErrorFactory(id);

  return resource as INamedResource;
};

export const findNamedResourceByName = async (
  kind: NamedResourceKind,
  name: string,
  ownerId?: string,
) => {
  const config = getNamedResourceKindConfig(kind);

  return config.model.findOne({
    nameNormalized: normalizeWhitespace(name).toLowerCase(),
    $or: [{ type: 'system' }, { type: 'user', ownerId }],
  }) as Promise<INamedResource | null>;
};

export const findNamedResources = async (
  kind: NamedResourceKind,
  ownerId?: string,
  resourceIds?: string[],
) => {
  const config = getNamedResourceKindConfig(kind);

  type OwnerSystemType<T extends string | undefined> = [
    { ownerId: T },
    { type: 'system' },
  ];
  type Query = {
    $or?: OwnerSystemType<string>;
    $and?: OwnerSystemType<undefined>;
    _id?: { $in: string[] };
  };

  const query: Query = {};

  if (ownerId !== undefined) query.$or = [{ ownerId }, { type: 'system' }];
  else query.$and = [{ ownerId }, { type: 'system' }];

  if (resourceIds) query._id = { $in: resourceIds };

  return config.model.find(query) as Promise<INamedResource[]>;
};
