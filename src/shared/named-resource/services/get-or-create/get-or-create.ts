import { findNamedResourceByName } from '@shared/named-resource/db';
import {
  getNamedResourceKindConfig,
  NamedResourceResponse,
} from '@shared/named-resource/kind-config';
import { NamedResourceKind } from '@shared/named-resource/types';

import { createNamedResource } from '../create';

export const getOrCreateNamedResource = async <
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  ownerId: string,
  name: string,
): Promise<TResponse> => {
  const config = getNamedResourceKindConfig(kind);
  const resource = await findNamedResourceByName(kind, name, ownerId);

  if (resource) return config.serialize(resource) as TResponse;

  return createNamedResource(kind, ownerId, { name });
};
