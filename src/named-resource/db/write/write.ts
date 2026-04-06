import {
  getNamedResourceKindConfig,
  NamedResourceResponse,
} from '@named-resource/kind-config';
import { INamedResource } from '@named-resource/model';
import { NamedResourceKind } from '@named-resource/types';

import { NamedResourceCreateProps, NamedResourceUpdateProps } from '../types';

export const persistNamedResource = async <
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  props: NamedResourceCreateProps,
) => {
  const config = getNamedResourceKindConfig(kind);

  const newResource = await config.model.create(props);
  return config.serialize(newResource as INamedResource) as TResponse;
};

export const saveNamedResourceChanges = async <
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  resource: INamedResource,
  newProps: NamedResourceUpdateProps,
) => {
  const config = getNamedResourceKindConfig(kind);

  Object.assign(resource, newProps);
  await resource.save();

  return config.serialize(resource) as TResponse;
};
