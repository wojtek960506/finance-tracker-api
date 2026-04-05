import { createNamedResourceModel, INamedResource } from '@shared/named-resource/model';
import {
  NamedResourceAttributes,
  NamedResourceType,
} from '@shared/named-resource/types';

export type CategoryType = NamedResourceType;

export type CategoryAttributes = NamedResourceAttributes;

export type ICategory = INamedResource;

export const CategoryModel = createNamedResourceModel<ICategory>(
  'Category',
  'Invalid ownerId for category type',
);
