import { createCategory } from "@services/categories";
import { CategoryAlreadyExistsError } from "@utils/errors";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { describe, expect, it, Mock, vi, afterEach } from "vitest";
import { findCategoryByName, persistCategory } from "@db/categories";
import {
  CATEGORY_TYPE_USER,
  getUserCategoryResultSerialized,
} from "@/test-utils/factories/category";


vi.mock("@db/categories", () => ({ findCategoryByName: vi.fn(), persistCategory: vi.fn() }));

describe("createCategory", () => {

  const categoryResult = getUserCategoryResultSerialized();
  const NAME = "Food";

  afterEach(() => { vi.clearAllMocks() });

  it("create category", async () => {
    (findCategoryByName as Mock).mockResolvedValue(undefined);
    (persistCategory as Mock).mockResolvedValue(categoryResult);

    const result = await createCategory(USER_ID_STR, { name: NAME });

    expect(findCategoryByName).toHaveBeenCalledOnce();
    expect(findCategoryByName).toHaveBeenCalledWith(NAME);
    expect(persistCategory).toHaveBeenCalledOnce();
    expect(persistCategory).toHaveBeenCalledWith({
      ownerId: USER_ID_STR,
      type: CATEGORY_TYPE_USER,
      name: NAME,
      nameNormalized: NAME.toLowerCase(),
    });
    expect(result).toEqual(categoryResult);
  });

  it("throws an error when category with given name exists", async () => {
    (findCategoryByName as Mock).mockResolvedValue(categoryResult);

    await expect(
      createCategory(USER_ID_STR, { name: NAME })
    ).rejects.toThrow(CategoryAlreadyExistsError);

    expect(findCategoryByName).toHaveBeenCalledOnce();
    expect(findCategoryByName).toHaveBeenCalledWith(NAME);
    expect(persistCategory).not.toHaveBeenCalled();
  });
});
