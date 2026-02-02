import { randomObjectIdString } from "@utils/random";
import { CategoryNotFoundError } from "@utils/errors";
import { CategoryModel } from "@models/category-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { findCategory } from "@db/categories/find-category/find-category";


vi.mock("@models/category-model", () => ({ CategoryModel: { findById: vi.fn() } }));

describe("findCategory", () => {

  const [USER_CATEGORY_ID, OWNER_ID] = [randomObjectIdString(), randomObjectIdString()];
  const userCategory = {
    id: USER_CATEGORY_ID,
    type: "user",
    name: "Food",
    nameNormalized: "food",
    ownerId: OWNER_ID,
  };

  // const SYSTEM_CATEGORY_ID = randomObjectIdString();
  // const systemCategory = {
  //   id: SYSTEM_CATEGORY_ID,
  //   type: "system",
  //   name: "exchange",
  //   nameNormalized: "exchange",
  //   ownerId: undefined,
  // };

  afterEach(() => { vi.clearAllMocks() });

  it("category exists", async () => {
    (CategoryModel.findById as Mock).mockResolvedValue(userCategory);

    const result = await findCategory(USER_CATEGORY_ID);

    expect(CategoryModel.findById).toHaveBeenCalledOnce();
    expect(CategoryModel.findById).toHaveBeenCalledWith(USER_CATEGORY_ID);
    expect(result).toEqual(userCategory);
  });

  it("category does not exist", async () => {
    (CategoryModel.findById as Mock).mockResolvedValue(undefined);

    await expect(findCategory(USER_CATEGORY_ID)).rejects.toThrow(CategoryNotFoundError);

    expect(CategoryModel.findById).toHaveBeenCalledOnce();
    expect(CategoryModel.findById).toHaveBeenCalledWith(USER_CATEGORY_ID);
  });
});
