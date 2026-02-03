import { createCategory } from "@services/categories";
import { CategoryAlreadyExistsError } from "@utils/errors";
import { describe, expect, it, Mock, vi, afterEach } from "vitest";
import { findCategoryByName, persistCategory } from "@db/categories";
import {
  CATEGORY_OWNER_ID,
  getUserCategoryResultSerialized,
} from "@/test-utils/factories";


vi.mock("@db/categories", () => ({ findCategoryByName: vi.fn(), persistCategory: vi.fn() }));

describe("createCategory", () => {

  const categoryResult = getUserCategoryResultSerialized();
  const NAME = "Food";

  afterEach(() => { vi.clearAllMocks() });

  it("create category", async () => {
    (findCategoryByName as Mock).mockResolvedValue(undefined);
    (persistCategory as Mock).mockResolvedValue(categoryResult);

    const result = await createCategory(CATEGORY_OWNER_ID, { name: NAME });

    expect(findCategoryByName).toHaveBeenCalledOnce();
    expect(findCategoryByName).toHaveBeenCalledWith(NAME);
    expect(persistCategory).toHaveBeenCalledOnce();
    expect(persistCategory).toHaveBeenCalledWith({
      ownerId: CATEGORY_OWNER_ID,
      type: "user",
      name: NAME,
      nameNormalized: NAME.toLowerCase(),
    });
    expect(result).toEqual(categoryResult);
  });

  it("throws an error when category with given name exists", async () => {
    (findCategoryByName as Mock).mockResolvedValue(categoryResult);

    await expect(
      createCategory(CATEGORY_OWNER_ID, { name: NAME })
    ).rejects.toThrow(CategoryAlreadyExistsError);

    expect(findCategoryByName).toHaveBeenCalledOnce();
    expect(findCategoryByName).toHaveBeenCalledWith(NAME);
    expect(persistCategory).not.toHaveBeenCalled();
  });
});
