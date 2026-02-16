import { CategoryNotFoundError } from "@utils/errors";
import { CategoryModel } from "@models/category-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { findCategoryById, findCategoryByName } from "./find-category";
import {
  FOOD_CATEGORY_ID_STR,
  getUserCategoryResultSerialized,
} from "@/test-utils/factories/category";


vi.mock("@models/category-model", () => (
  { CategoryModel: { findById: vi.fn(), findOne: vi.fn() } })
);

const userCategory = getUserCategoryResultSerialized();

describe("findCategoryById", () => {

  afterEach(() => { vi.clearAllMocks() });

  it("category exists", async () => {
    (CategoryModel.findById as Mock).mockResolvedValue(userCategory);

    const result = await findCategoryById(FOOD_CATEGORY_ID_STR);

    expect(CategoryModel.findById).toHaveBeenCalledOnce();
    expect(CategoryModel.findById).toHaveBeenCalledWith(FOOD_CATEGORY_ID_STR);
    expect(result).toEqual(userCategory);
  });

  it("category does not exist", async () => {
    (CategoryModel.findById as Mock).mockResolvedValue(undefined);

    await expect(findCategoryById(FOOD_CATEGORY_ID_STR)).rejects.toThrow(CategoryNotFoundError);

    expect(CategoryModel.findById).toHaveBeenCalledOnce();
    expect(CategoryModel.findById).toHaveBeenCalledWith(FOOD_CATEGORY_ID_STR);
  });
});

describe("findCategoryByName", () => {

  afterEach(() => { vi.clearAllMocks() });

  it("find category by name", async () => {
    (CategoryModel.findOne as Mock).mockReturnValue(userCategory);

    const result = await findCategoryByName("  FooD  ");

    expect(CategoryModel.findOne).toHaveBeenCalledOnce();
    expect(CategoryModel.findOne).toHaveBeenCalledWith({
      nameNormalized: "food",
      $or: [{ type: "system" }, { type: "user", ownerId: undefined }],
    });
    expect(result).toEqual(userCategory);
  });
});
