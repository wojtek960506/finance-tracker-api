import { removeFavoriteNamedResource } from '@named-resource-favorite/db';
import { DeleteResult } from 'mongoose';

import { NamedResourceKind } from '@shared/named-resource/types';

import { assertNamedResourceAccess } from './assert-named-resource-access';

export const unfavoriteNamedResource = async (
  kind: NamedResourceKind,
  resourceId: string,
  ownerId: string,
): Promise<DeleteResult> => {
  await assertNamedResourceAccess(kind, resourceId, ownerId);

  return removeFavoriteNamedResource(ownerId, kind, resourceId);
};
