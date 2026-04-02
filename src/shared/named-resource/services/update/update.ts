import { checkOwner, CheckOwnerType } from '@shared/services';
import { AppError } from '@utils/errors';
import { normalizeWhitespace } from '@utils/strings';

import { NamedResourceMinimal, NameDTO } from '../types';

export const updateNamedResource = <
  TResource extends NamedResourceMinimal,
  TResponse,
>(deps: {
  findById: (id: string) => Promise<TResource>;
  saveChanges: (
    resource: TResource,
    props: { name: string; nameNormalized: string },
  ) => Promise<TResponse>;
  checkOwnerType: CheckOwnerType;
  systemUpdateNotAllowedFactory: (id: string) => Error;
  userMissingOwnerFactory: (id: string) => Error;
  alreadyExistsErrorFactory: (name: string) => Error;
}) => {
  return async (
    resourceId: string,
    ownerId: string,
    dto: NameDTO,
  ): Promise<TResponse> => {
    const resource = await deps.findById(resourceId);
    if (resource.type === 'system') throw deps.systemUpdateNotAllowedFactory(resourceId);
    if (!resource.ownerId) throw deps.userMissingOwnerFactory(resourceId);
    checkOwner(ownerId, resourceId, resource.ownerId, deps.checkOwnerType);

    const normalizedName = normalizeWhitespace(dto.name);
    try {
      return await deps.saveChanges(resource, {
        name: normalizedName,
        nameNormalized: normalizedName.toLowerCase(),
      });
    } catch (err) {
      if ((err as { code: number }).code === 11000)
        throw deps.alreadyExistsErrorFactory(dto.name);
      else throw new AppError(400, (err as { message: string }).message);
    }
  };
};
