import { findCategoryById } from "./find-category";
import { CategoryNotFoundError } from "@utils/errors";
import { CategoryModel } from "@models/category-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import {
  USER_CATEGORY_ID,
  getUserCategoryResultSerialized,
} from "@/test-utils/factories";


vi.mock("@models/category-model", () => ({ CategoryModel: { findById: vi.fn() } }));

describe("findCategory", () => {

  const userCategory = getUserCategoryResultSerialized();

  afterEach(() => { vi.clearAllMocks() });

  it("category exists", async () => {
    (CategoryModel.findById as Mock).mockResolvedValue(userCategory);

    const result = await findCategoryById(USER_CATEGORY_ID);

    expect(CategoryModel.findById).toHaveBeenCalledOnce();
    expect(CategoryModel.findById).toHaveBeenCalledWith(USER_CATEGORY_ID);
    expect(result).toEqual(userCategory);
  });

  it("category does not exist", async () => {
    (CategoryModel.findById as Mock).mockResolvedValue(undefined);

    await expect(findCategoryById(USER_CATEGORY_ID)).rejects.toThrow(CategoryNotFoundError);

    expect(CategoryModel.findById).toHaveBeenCalledOnce();
    expect(CategoryModel.findById).toHaveBeenCalledWith(USER_CATEGORY_ID);
  });
});
