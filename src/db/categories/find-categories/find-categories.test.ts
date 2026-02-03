import { findCategories } from "@db/categories";
import { describe, expect, it, vi } from "vitest";
import * as serializers from "@schemas/serializers";
import { CategoryModel } from "@models/category-model";
import {
  CATEGORY_OWNER_ID,
  getUserCategoryResultSerialized,
  getSystemCategoryResultSerialized,
} from "@/test-utils/factories";


describe("findCategories", () => {

  const userCategory = getUserCategoryResultSerialized();
  const systemCategory = getSystemCategoryResultSerialized();
  const categories = [userCategory, systemCategory];

  it("find categories", async () => {
    vi.spyOn(CategoryModel, "find").mockResolvedValue(categories);
    vi.spyOn(serializers, "serializeCategory").mockReturnValueOnce(userCategory as any);
    vi.spyOn(serializers, "serializeCategory").mockReturnValueOnce(systemCategory as any);

    const result = await findCategories(CATEGORY_OWNER_ID);

    expect(serializers.serializeCategory).toHaveBeenCalledTimes(2);
    expect(CategoryModel.find).toHaveBeenCalledWith(
      { $or: [{ ownerId: CATEGORY_OWNER_ID }, { type: "system" }]})
    expect(result).toEqual(categories);
  });
});
