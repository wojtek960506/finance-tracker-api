import { findNamedResourceById } from '@named-resource/db';
import { getNamedResourceKindConfig } from '@named-resource/kind-config';
import { INamedResource } from '@named-resource/model';
import { NamedResourceKind } from '@named-resource/types';
import { checkOwner } from '@shared/services';

export const assertNamedResourceAccess = async (
  kind: NamedResourceKind,
  resourceId: string,
  ownerId: string,
) => {
  const config = getNamedResourceKindConfig(kind);
  const resource = await findNamedResourceById(kind, resourceId);

  if (resource.type !== 'system')
    checkOwner(ownerId, resourceId, resource.ownerId!, config.checkOwnerType);

  return resource as INamedResource;
};
