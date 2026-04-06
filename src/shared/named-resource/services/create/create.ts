import { findNamedResourceByName, persistNamedResource } from '@named-resource/db';
import {
  getNamedResourceKindConfig,
  NamedResourceResponse,
} from '@named-resource/kind-config';
import { NamedResourceKind } from '@named-resource/types';
import { normalizeWhitespace } from '@utils/strings';

import { NameDTO } from '../types';

export const createNamedResource = async <
  TDTO extends NameDTO,
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  ownerId: string,
  dto: TDTO,
): Promise<TResponse> => {
  const { name } = dto;
  const config = getNamedResourceKindConfig(kind);

  const resource = await findNamedResourceByName(kind, name, ownerId);
  if (resource) {
    if (resource.type === 'system') throw config.systemNameConflictErrorFactory(name);
    throw config.alreadyExistsErrorFactory(name);
  }

  const normalizedName = normalizeWhitespace(name);
  const createdResource = await persistNamedResource<TResponse>(kind, {
    ownerId,
    type: 'user',
    name: normalizedName,
    nameNormalized: normalizedName.toLowerCase(),
  });

  return {
    ...createdResource,
    isFavorite: false,
  };
};
