import * as serializers from "@schemas/serializers";
import { CategoryNotFoundError } from "@utils/errors";
import { CategoryModel } from "@models/category-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { findCategoryById, findCategoryByName } from "./find-category";
import {
  USER_CATEGORY_ID,
  getUserCategoryResultSerialized,
} from "@/test-utils/factories";


vi.mock("@models/category-model", () => (
  { CategoryModel: { findById: vi.fn(), find: vi.fn() } })
);

const userCategory = getUserCategoryResultSerialized();

describe("findCategoryById", () => {

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

describe("findCategoryByName", () => {

  afterEach(() => { vi.clearAllMocks() });

  it("category exists", async () => {
    vi.spyOn(serializers, "serializeCategory").mockReturnValue(userCategory);
    (CategoryModel.find as Mock).mockResolvedValue([userCategory]);

    const result = await findCategoryByName("  FooD  ");

    expect(CategoryModel.find).toHaveBeenCalledOnce();
    expect(CategoryModel.find).toHaveBeenCalledWith({ nameNormalized: "food" });
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(result).toEqual(userCategory);
  });

  it("category does not exist", async () => {
    vi.spyOn(serializers, "serializeCategory");
    (CategoryModel.find as Mock).mockResolvedValue([]);

    await expect(findCategoryByName(" a     B   c ")).rejects.toThrow(CategoryNotFoundError);

    expect(CategoryModel.find).toHaveBeenCalledOnce();
    expect(CategoryModel.find).toHaveBeenCalledWith({ nameNormalized: "a b c" });
    expect(serializers.serializeCategory).not.toHaveBeenCalled();
  });
});
