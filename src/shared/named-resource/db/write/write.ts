import { Model } from 'mongoose';

import {
  NamedResourceCreateProps,
  NamedResourceMinimal,
  NamedResourceUpdateProps,
} from '../types';

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
