import * as db from "@db/categories";
import { getCategory } from "./get-category";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  USER_CATEGORY_ID,
  CATEGORY_OWNER_ID,
  SYSTEM_CATEGORY_ID,
  getUserCategoryResultSerialized,
  getSystemCategoryResultSerialized,
} from "@/test-utils/factories";


describe("getCategory", () => {

  const systemCategory = getSystemCategoryResultSerialized();
  const userCategory = getUserCategoryResultSerialized();

  afterEach(() => { vi.clearAllMocks() });

  it.each([
    ["system category without", systemCategory, SYSTEM_CATEGORY_ID],
    ["user category with", userCategory, USER_CATEGORY_ID],
  ])("get %s checkout owner", async (_, category, categoryId) => {
    vi.spyOn(db, "findCategoryById").mockResolvedValue(category as any);

    const result = await getCategory(categoryId, CATEGORY_OWNER_ID);

    expect(db.findCategoryById).toHaveBeenCalledOnce();
    expect(db.findCategoryById).toHaveBeenCalledWith(categoryId);
    expect(result).toEqual(category);
  });
});
