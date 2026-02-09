import * as db from "@db/categories";
import { getCategory } from "./get-category";
import * as serializers from "@schemas/serializers";
import { afterEach, describe, expect, it, vi } from "vitest";
import { USER_ID_STR } from "@/test-utils/factories/general";
import {
  FOOD_CATEGORY_ID_STR,
  EXCHANGE_CATEGORY_ID_STR,
  getUserCategoryResultSerialized,
  getExchangeCategoryResultSerialized,
} from "@/test-utils/factories/category";



describe("getCategory", () => {

  const systemCategory = getExchangeCategoryResultSerialized();
  const userCategory = getUserCategoryResultSerialized();

  afterEach(() => { vi.clearAllMocks() });

  it.each([
    ["system category without", systemCategory, EXCHANGE_CATEGORY_ID_STR],
    ["user category with", userCategory, FOOD_CATEGORY_ID_STR],
  ])("get %s checkout owner", async (_, category, categoryId) => {
    vi.spyOn(serializers, "serializeCategory").mockReturnValue(category as any);
    vi.spyOn(db, "findCategoryById").mockResolvedValue(category as any);

    const result = await getCategory(categoryId, USER_ID_STR);

    expect(db.findCategoryById).toHaveBeenCalledOnce();
    expect(db.findCategoryById).toHaveBeenCalledWith(categoryId);
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledWith(category);
    expect(result).toEqual(category);
  });
});
