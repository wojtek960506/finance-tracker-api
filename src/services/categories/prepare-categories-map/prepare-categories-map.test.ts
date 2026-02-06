import * as db from "@db/categories";
import { describe, expect, it, vi } from "vitest";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { prepareCategoriesMap } from "./prepare-categories-map";
import {
  CATEGORY_TYPE_USER,
  FOOD_CATEGORY_NAME,
  CATEGORY_TYPE_SYSTEM,
  FOOD_CATEGORY_ID_STR,
  EXCHANGE_CATEGORY_NAME,
  EXCHANGE_CATEGORY_ID_STR,
  getUserCategoryResultJSON,
  getExchangeCategoryResultJSON,
} from "@/test-utils/factories/category";


describe("prepareCategoriesMap", () => {

  it("prepare categories map", async () => {

    const exchangeCategory = getExchangeCategoryResultJSON();
    const foodCategory = getUserCategoryResultJSON();
    
    const categoryIds = [EXCHANGE_CATEGORY_ID_STR, FOOD_CATEGORY_ID_STR];
    const categories = [exchangeCategory, foodCategory];

    vi.spyOn(db, "findCategories").mockResolvedValue(categories as any);

    const result = await prepareCategoriesMap(USER_ID_STR, categoryIds);

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
      }
    });
  });
});
