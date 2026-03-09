import { afterEach, describe, expect, it, vi } from 'vitest';

import * as db from '@category/db';
import * as serializers from '@category/serializers';

import { getCategory } from '@/category/services';
import {
  EXCHANGE_CATEGORY_ID_STR,
  FOOD_CATEGORY_ID_STR,
  getExchangeCategoryResultSerialized,
  getUserCategoryResultSerialized,
} from '@/testing/factories/category';
import { USER_ID_STR } from '@/testing/factories/general';

describe('getCategory', () => {
  const systemCategory = getExchangeCategoryResultSerialized();
  const userCategory = getUserCategoryResultSerialized();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['system category without', systemCategory, EXCHANGE_CATEGORY_ID_STR],
    ['user category with', userCategory, FOOD_CATEGORY_ID_STR],
  ])('get %s checkout owner', async (_, category, categoryId) => {
    vi.spyOn(serializers, 'serializeCategory').mockReturnValue(category as any);
    vi.spyOn(db, 'findCategoryById').mockResolvedValue(category as any);

    const result = await getCategory(categoryId, USER_ID_STR);

    expect(db.findCategoryById).toHaveBeenCalledOnce();
    expect(db.findCategoryById).toHaveBeenCalledWith(categoryId);
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledWith(category);
    expect(result).toEqual(category);
  });
});
