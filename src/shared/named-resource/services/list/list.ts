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
  const resources = await findNamedResources(kind, ownerId);

  return resources.map((resource) => config.serialize(resource) as TResponse);
};
