import * as db from "@db/categories";
import { updateCategory } from "@services/categories";
import { afterEach, describe, expect, it, vi } from "vitest";
import { USER_ID_STR } from "@/test-utils/factories/general-consts";
import {
  UserCategoryMissingOwner,
  SystemCategoryUpdateNotAllowed,
} from "@utils/errors";
import {
  FOOD_CATEGORY_ID_STR,
  getUpdateCategoryProps,
  EXCHANGE_CATEGORY_ID_STR,
  getUserCategoryResultSerialized,
  getExchangeCategoryResultSerialized,
} from "@/test-utils/factories";



describe("updateCategory", () => {

  const userCategory = getUserCategoryResultSerialized();
  const systemCategory = getExchangeCategoryResultSerialized();
  const dto = getUpdateCategoryProps();

  afterEach(() => { vi.clearAllMocks() });

  it("update category", async () => {
    vi.spyOn(db, "findCategoryById").mockResolvedValue(userCategory as any);
    vi.spyOn(db, "saveCategoryChanges").mockResolvedValue(userCategory as any);

    const result = await updateCategory(FOOD_CATEGORY_ID_STR, USER_ID_STR, dto);

    expect(db.findCategoryById).toHaveBeenCalledOnce();
    expect(db.saveCategoryChanges).toHaveBeenCalledOnce();
    expect(result).toEqual(userCategory);
  });

  it.each([
    ["system category", systemCategory, EXCHANGE_CATEGORY_ID_STR, SystemCategoryUpdateNotAllowed],
    [
      "user category without owner",
      { ...userCategory, ownerId: undefined },
      FOOD_CATEGORY_ID_STR,
      UserCategoryMissingOwner,
    ],
  ])("throws error when updating %s", async (_, category, id, error) => {
    vi.spyOn(db, "findCategoryById").mockResolvedValue(category as any);
    vi.spyOn(db, "saveCategoryChanges");

    await expect(updateCategory(id, USER_ID_STR, dto)).rejects.toThrow(error);

    expect(db.findCategoryById).toHaveBeenCalledOnce();
    expect(db.findCategoryById).toHaveBeenCalledWith(id);
    expect(db.saveCategoryChanges).not.toHaveBeenCalled();
  });
});
