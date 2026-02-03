import * as db from "@db/categories";
import { updateCategory } from "@services/categories";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  UserCategoryMissingOwner,
  SystemCategoryUpdateNotAllowed,
} from "@utils/errors";
import {
  USER_CATEGORY_ID,
  CATEGORY_OWNER_ID,
  SYSTEM_CATEGORY_ID,
  getUpdateCategoryProps,
  getUserCategoryResultSerialized,
  getSystemCategoryResultSerialized,
} from "@/test-utils/factories";


describe("updateCategory", () => {

  const userCategory = getUserCategoryResultSerialized();
  const systemCategory = getSystemCategoryResultSerialized();
  const dto = getUpdateCategoryProps();

  afterEach(() => { vi.clearAllMocks() });

  it("update category", async () => {
    vi.spyOn(db, "findCategoryById").mockResolvedValue(userCategory as any);
    vi.spyOn(db, "saveCategoryChanges").mockResolvedValue(userCategory as any);

    const result = await updateCategory(USER_CATEGORY_ID, CATEGORY_OWNER_ID, dto);

    expect(db.findCategoryById).toHaveBeenCalledOnce();
    expect(db.saveCategoryChanges).toHaveBeenCalledOnce();
    expect(result).toEqual(userCategory);
  });

  it.each([
    ["system category", systemCategory, SYSTEM_CATEGORY_ID, SystemCategoryUpdateNotAllowed],
    [
      "user category without owner",
      { ...userCategory, ownerId: undefined },
      USER_CATEGORY_ID,
      UserCategoryMissingOwner,
    ],
  ])("throws error when updating %s", async (_, category, id, error) => {
    vi.spyOn(db, "findCategoryById").mockResolvedValue(category as any);
    vi.spyOn(db, "saveCategoryChanges");

    await expect(updateCategory(id, CATEGORY_OWNER_ID, dto)).rejects.toThrow(error);

    expect(db.findCategoryById).toHaveBeenCalledOnce();
    expect(db.findCategoryById).toHaveBeenCalledWith(id);
    expect(db.saveCategoryChanges).not.toHaveBeenCalled();
  });
});
