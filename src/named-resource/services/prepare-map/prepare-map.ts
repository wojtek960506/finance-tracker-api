import { findNamedResources } from '@named-resource/db';
import { NamedResourcesMap } from '@named-resource/kind-config';
import { NamedResourceKind } from '@named-resource/types';

const buildNamedResourcesMap = <
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

export const prepareNamedResourcesMap = async (
  kind: NamedResourceKind,
  ownerId: string,
  resourceIds?: string[],
): Promise<NamedResourcesMap> => {
  const resources = await findNamedResources(kind, ownerId, resourceIds);
  return buildNamedResourcesMap(resources);
};
