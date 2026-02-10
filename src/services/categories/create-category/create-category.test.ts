import { createCategory } from "@services/categories";
import { CategoryAlreadyExistsError, CategoryNotFoundError } from "@utils/errors";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { describe, expect, it, Mock, vi, afterEach } from "vitest";
import { findCategoryByName, persistCategory } from "@db/categories";
import {
  CATEGORY_TYPE_USER,
  FOOD_CATEGORY_NAME,
  getUserCategoryResultSerialized,
} from "@/test-utils/factories/category";


vi.mock("@db/categories", () => ({ findCategoryByName: vi.fn(), persistCategory: vi.fn() }));

describe("createCategory", () => {

  const categoryResult = getUserCategoryResultSerialized();

  afterEach(() => { vi.clearAllMocks() });

  it.each([
    ["undefined", false], ["error", true]
  ])("create category - not found with %s", async (_, isError) => {
    if (isError)
      (findCategoryByName as Mock).mockRejectedValue(new CategoryNotFoundError());
    else
      (findCategoryByName as Mock).mockResolvedValue(undefined);
    (persistCategory as Mock).mockResolvedValue(categoryResult);

    const result = await createCategory(USER_ID_STR, { name: FOOD_CATEGORY_NAME });

    expect(findCategoryByName).toHaveBeenCalledOnce();
    expect(findCategoryByName).toHaveBeenCalledWith(FOOD_CATEGORY_NAME);
    expect(persistCategory).toHaveBeenCalledOnce();
    expect(persistCategory).toHaveBeenCalledWith({
      ownerId: USER_ID_STR,
      type: CATEGORY_TYPE_USER,
      name: FOOD_CATEGORY_NAME,
      nameNormalized: FOOD_CATEGORY_NAME.toLowerCase(),
    });
    expect(result).toEqual(categoryResult);
  });

  it("throws an error when category with given name exists", async () => {
    (findCategoryByName as Mock).mockResolvedValue(categoryResult);

    await expect(
      createCategory(USER_ID_STR, { name: FOOD_CATEGORY_NAME })
    ).rejects.toThrow(CategoryAlreadyExistsError);

    expect(findCategoryByName).toHaveBeenCalledOnce();
    expect(findCategoryByName).toHaveBeenCalledWith(FOOD_CATEGORY_NAME);
    expect(persistCategory).not.toHaveBeenCalled();
  });
});
