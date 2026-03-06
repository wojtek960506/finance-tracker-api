import { afterEach, describe, expect, it, vi } from 'vitest';

import { findCategories } from '@category/db';
import { CategoryModel } from '@category/model';

import {
  EXCHANGE_CATEGORY_ID_STR,
  FOOD_CATEGORY_ID_STR,
  getExchangeCategoryResultSerialized,
  getUserCategoryResultSerialized,
} from '@/test-utils/factories/category';
import { USER_ID_STR } from '@/test-utils/factories/general';

describe('findCategories', () => {
  const userCategory = getUserCategoryResultSerialized();
  const systemCategory = getExchangeCategoryResultSerialized();

  afterEach(() => {
    vi.clearAllMocks();
  });

  const categoryIdsArr = [FOOD_CATEGORY_ID_STR, EXCHANGE_CATEGORY_ID_STR];

  it.each([
    [
      'are specified',
      [userCategory, systemCategory],
      USER_ID_STR,
      categoryIdsArr,
      {
        $or: [{ ownerId: USER_ID_STR }, { type: 'system' }],
        _id: { $in: categoryIdsArr },
      },
    ],
    [
      'are not specified',
      [systemCategory],
      undefined,
      undefined,
      { $and: [{ ownerId: undefined }, { type: 'system' }] },
    ],
  ])(
    'find categories when `ownerId` and `categoryIds` are specified',
    async (_, categories, ownerId, categoryIds, findCalledWith) => {
      vi.spyOn(CategoryModel, 'find').mockReturnValue(categories as any);

      const result = await findCategories(ownerId, categoryIds);

      expect(CategoryModel.find).toHaveBeenCalledOnce();
      expect(CategoryModel.find).toHaveBeenCalledWith(findCalledWith);
      expect(result).toEqual(categories);
    },
  );
});
