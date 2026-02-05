import { findCategories } from "@db/categories";
import { describe, expect, it, vi } from "vitest";
import * as serializers from "@schemas/serializers";
import { CategoryModel } from "@models/category-model";
import { USER_ID_STR } from "@/test-utils/factories/general";
import {
  getUserCategoryResultSerialized,
  getExchangeCategoryResultSerialized,
} from "@/test-utils/factories/category";


describe("findCategories", () => {

  const userCategory = getUserCategoryResultSerialized();
  const systemCategory = getExchangeCategoryResultSerialized();
  const categories = [userCategory, systemCategory];

  it("find categories", async () => {
    vi.spyOn(CategoryModel, "find").mockResolvedValue(categories);
    vi.spyOn(serializers, "serializeCategory").mockReturnValueOnce(userCategory as any);
    vi.spyOn(serializers, "serializeCategory").mockReturnValueOnce(systemCategory as any);

    const result = await findCategories(USER_ID_STR);

    expect(serializers.serializeCategory).toHaveBeenCalledTimes(2);
    expect(CategoryModel.find).toHaveBeenCalledWith(
      { $or: [{ ownerId: USER_ID_STR }, { type: "system" }]})
    expect(result).toEqual(categories);
  });
});
