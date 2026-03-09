import { ICategory } from '@category/model';
import { CategoryResponseDTO } from '@category/schema';
import { serializeCategory } from '@category/serializers';
import {
  NamedResourceUpdateProps,
  saveNamedResourceChanges,
} from '@shared/named-resource';

export type CategoryUpdateProps = NamedResourceUpdateProps &
  Pick<CategoryResponseDTO, 'name' | 'nameNormalized'>;

export const saveCategoryChanges = async (
  category: ICategory,
  newProps: CategoryUpdateProps,
) => {
  return saveNamedResourceChanges(category, newProps, serializeCategory);
};
