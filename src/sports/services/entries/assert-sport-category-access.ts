import { findNamedResourceById } from '@named-resource/db';
import { getNamedResourceKindConfig } from '@named-resource/kind-config';
import { INamedResource } from '@named-resource/model';
import { checkOwner } from '@shared/services';

export const assertSportCategoryAccess = async (
  categoryId: string,
  ownerId: string,
): Promise<INamedResource> => {
  const config = getNamedResourceKindConfig('sportCategory');
  const category = await findNamedResourceById('sportCategory', categoryId);

  if (category.type !== 'system') {
    checkOwner(ownerId, categoryId, category.ownerId!, config.checkOwnerType);
  }

  return category as INamedResource;
};
