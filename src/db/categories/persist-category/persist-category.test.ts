import { persistCategory } from "@db/categories";
import { describe, expect, it, vi } from "vitest";
import * as serializers from "@schemas/serializers";
import { CategoryModel } from "@models/category-model";
import {
  getUserCategoryProps,
  getUserCategoryResultJSON,
  getUserCategoryResultSerialized,
} from "@/test-utils/factories/category";


describe("persistCategory", () => {

  const categoryProps = getUserCategoryProps();
  const categoryJSON = getUserCategoryResultJSON();
  const categorySerialized = getUserCategoryResultSerialized();

  it("persist category", async () => {
    vi.spyOn(CategoryModel, "create").mockResolvedValue(categoryJSON as any);
    vi.spyOn(serializers, "serializeCategory").mockReturnValue(categorySerialized as any);

    const result = await persistCategory(categoryProps);

    expect(CategoryModel.create).toHaveBeenCalledOnce();
    expect(CategoryModel.create).toHaveBeenCalledWith(categoryProps);
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledWith(categoryJSON);
    expect(result).toEqual(categorySerialized);
  });
});
