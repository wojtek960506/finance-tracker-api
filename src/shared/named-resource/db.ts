import { Model } from 'mongoose';

import { normalizeWhitespace } from '@utils/strings';

type NamedResourceMinimal = {
  type: 'user' | 'system';
  ownerId?: unknown;
  _id: { toString: () => string };
  name: string;
  save: () => Promise<unknown>;
};

export type NamedResourceCreateProps = {
  ownerId: string;
  type: 'user' | 'system';
  name: string;
  nameNormalized: string;
};

export type NamedResourceUpdateProps = Pick<
  NamedResourceCreateProps,
  'name' | 'nameNormalized'
>;

export const findNamedResourceById = async <TResource extends NamedResourceMinimal>(
  model: Model<TResource>,
  id: string,
  notFoundErrorFactory: (id: string) => Error,
) => {
  const resource = await model.findById(id);
  if (!resource) throw notFoundErrorFactory(id);
  return resource as TResource;
};

export const findNamedResourceByName = async <TResource extends NamedResourceMinimal>(
  model: Model<TResource>,
  name: string,
  ownerId?: string,
) => {
  return model.findOne({
    nameNormalized: normalizeWhitespace(name).toLowerCase(),
    $or: [{ type: 'system' }, { type: 'user', ownerId }],
  });
};

export const findNamedResources = async <TResource extends NamedResourceMinimal>(
  model: Model<TResource>,
  ownerId?: string,
  resourceIds?: string[],
) => {
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

  return model.find(query);
};

export const persistNamedResource = async <
  TResource extends NamedResourceMinimal,
  TResponse,
>(
  model: Model<TResource>,
  props: NamedResourceCreateProps,
  serialize: (resource: TResource) => TResponse,
) => {
  const newResource = await model.create(props);
  return serialize(newResource);
};

export const saveNamedResourceChanges = async <
  TResource extends NamedResourceMinimal,
  TResponse,
>(
  resource: TResource,
  newProps: NamedResourceUpdateProps,
  serialize: (resource: TResource) => TResponse,
) => {
  Object.assign(resource, newProps);
  await resource.save();

  return serialize(resource);
};
