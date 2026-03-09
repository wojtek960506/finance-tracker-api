import { ICategory } from '@category/model';
import { CategoryResponseDTO } from '@category/schema';
import { serializeNamedResource } from '@shared/named-resource';

export const serializeCategory = (category: ICategory): CategoryResponseDTO => {
  return serializeNamedResource<CategoryResponseDTO>(category);
};
