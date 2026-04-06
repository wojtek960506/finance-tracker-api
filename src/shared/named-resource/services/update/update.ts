import { isFavoriteNamedResource } from '@named-resource-favorite/db';
import {
  findNamedResourceById,
  findNamedResourceByName,
  saveNamedResourceChanges,
} from '@shared/named-resource/db';
import {
  getNamedResourceKindConfig,
  NamedResourceResponse,
} from '@shared/named-resource/kind-config';
import { NamedResourceKind } from '@shared/named-resource/types';
import { checkOwner } from '@shared/services';
import { AppError } from '@utils/errors';
import { normalizeWhitespace } from '@utils/strings';

import { NameDTO } from '../types';

export const updateNamedResource = async <
  TDTO extends NameDTO,
  TResponse extends NamedResourceResponse = NamedResourceResponse,
>(
  kind: NamedResourceKind,
  resourceId: string,
  ownerId: string,
  dto: TDTO,
): Promise<TResponse> => {
  const config = getNamedResourceKindConfig(kind);
  const resource = await findNamedResourceById(kind, resourceId);

  if (resource.type === 'system') throw config.systemUpdateNotAllowedFactory(resourceId);
  if (!resource.ownerId) throw config.userMissingOwnerFactory(resourceId);
  checkOwner(ownerId, resourceId, resource.ownerId, config.checkOwnerType);

  const normalizedName = normalizeWhitespace(dto.name);
  const resourceWithSameName = await findNamedResourceByName(
    kind,
    normalizedName,
    ownerId,
  );
  if (resourceWithSameName && resourceWithSameName._id?.toString() !== resourceId) {
    if (resourceWithSameName.type === 'system')
      throw config.systemNameConflictErrorFactory(dto.name);
    throw config.alreadyExistsErrorFactory(dto.name);
  }

  try {
    const updatedResource = await saveNamedResourceChanges<TResponse>(kind, resource, {
      name: normalizedName,
      nameNormalized: normalizedName.toLowerCase(),
    });

    return {
      ...updatedResource,
      isFavorite: await isFavoriteNamedResource(ownerId, kind, resourceId),
    };
  } catch (err) {
    if ((err as { code: number }).code === 11000)
      throw config.alreadyExistsErrorFactory(dto.name);

    throw new AppError(
      400,
      (err as { message: string }).message,
      undefined,
      'NAMED_RESOURCE_UPDATE_ERROR',
    );
  }
};
