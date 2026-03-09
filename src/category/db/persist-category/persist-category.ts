import { CategoryModel } from '@category/model';
import { CategoryResponseDTO } from '@category/schema';
import { serializeCategory } from '@category/serializers';
import { NamedResourceCreateProps, persistNamedResource } from '@shared/named-resource';

export type CategoryCreateProps = NamedResourceCreateProps &
  Omit<CategoryResponseDTO, 'id'>;

export const persistCategory = async (props: CategoryCreateProps) => {
  return persistNamedResource(CategoryModel, props, serializeCategory);
};
