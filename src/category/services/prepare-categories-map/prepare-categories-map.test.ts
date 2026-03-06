import { describe, expect, it, vi } from 'vitest';

import * as db from '@category/db';

import { prepareCategoriesMap } from './prepare-categories-map';

import {
  CATEGORY_TYPE_SYSTEM,
  CATEGORY_TYPE_USER,
  EXCHANGE_CATEGORY_ID_OBJ,
  EXCHANGE_CATEGORY_ID_STR,
  EXCHANGE_CATEGORY_NAME,
  FOOD_CATEGORY_ID_OBJ,
  FOOD_CATEGORY_ID_STR,
  FOOD_CATEGORY_NAME,
  getExchangeCategoryResultJSON,
  getUserCategoryResultJSON,
} from '@/testing/factories/category';
import { USER_ID_STR } from '@/testing/factories/general';

describe('prepareCategoriesMap', () => {
  it('prepare categories map', async () => {
    const exchangeCategory = getExchangeCategoryResultJSON();
    const foodCategory = getUserCategoryResultJSON();

    const transactions = [
      { categoryId: EXCHANGE_CATEGORY_ID_OBJ },
      { categoryId: FOOD_CATEGORY_ID_OBJ },
    ];
    const categoryIds = [EXCHANGE_CATEGORY_ID_STR, FOOD_CATEGORY_ID_STR];
    const categories = [exchangeCategory, foodCategory];

    vi.spyOn(db, 'findCategories').mockResolvedValue(categories as any);

    const result = await prepareCategoriesMap(USER_ID_STR, transactions);

    expect(db.findCategories).toHaveBeenCalledOnce();
    expect(db.findCategories).toHaveBeenCalledWith(USER_ID_STR, categoryIds);
    expect(result).toEqual({
      [EXCHANGE_CATEGORY_ID_STR]: {
        id: EXCHANGE_CATEGORY_ID_STR,
        type: CATEGORY_TYPE_SYSTEM,
        name: EXCHANGE_CATEGORY_NAME,
      },
      [FOOD_CATEGORY_ID_STR]: {
        id: FOOD_CATEGORY_ID_STR,
        type: CATEGORY_TYPE_USER,
        name: FOOD_CATEGORY_NAME,
      },
    });
  });
});
