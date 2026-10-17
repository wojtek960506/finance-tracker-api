import { INamedResource } from '@named-resource';

import { isPopulatedCategory, ISportEntry } from '../model';
import { SportEntryCategoryResponseDTO, SportEntryResponseDTO } from '../schema';
import { PopulatedSportCategory } from '../types';

export type SportCategoryInput =
  | SportEntryCategoryResponseDTO
  | INamedResource
  | PopulatedSportCategory;

const formatCategoryResponse = (
  cat: SportCategoryInput,
): SportEntryCategoryResponseDTO => {
  if ('id' in cat) {
    return {
      id: cat.id,
      name: cat.name,
      type: cat.type,
    };
  }

  return {
    id: cat._id.toString(),
    name: cat.name,
    type: cat.type,
  };
};

export const serializeSportEntry = (
  entry: ISportEntry,
  category?: SportCategoryInput,
): SportEntryResponseDTO => {
  const categoryField = entry.categoryId;

  const populatedCategory: SportEntryCategoryResponseDTO | undefined =
    isPopulatedCategory(categoryField)
      ? {
          id: categoryField._id.toString(),
          name: categoryField.name,
          type: categoryField.type,
        }
      : undefined;

  const resolvedCategory = category
    ? formatCategoryResponse(category)
    : populatedCategory;

  if (!resolvedCategory) {
    throw new Error('Category must be provided or populated to serialize sport entry');
  }

  const categoryIdStr = isPopulatedCategory(categoryField)
    ? categoryField._id.toString()
    : categoryField.toString();

  return {
    id: entry._id.toString(),
    ownerId: entry.ownerId.toString(),
    categoryId: categoryIdStr,
    category: resolvedCategory,
    date: entry.date,
    itemName: entry.itemName,
    costPln: entry.costPln,
    description: entry.description ?? null,
    transactionId: entry.transactionId ? entry.transactionId.toString() : null,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
};
