import * as db from "@db/categories";
import * as service from "@services/categories";
import * as serializers from "@schemas/serializers";
import { afterEach, describe, expect, it, vi } from "vitest";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { getOrCreateCategory } from "./get-or-create-category";
import {
  FOOD_CATEGORY_NAME,
  getUserCategoryResultJSON,
  getUserCategoryResultSerialized,
} from "@/test-utils/factories/category";


describe("getOrCreateCategory", () => {

  const categoryJSON = getUserCategoryResultJSON();
  const categorySerialized = getUserCategoryResultSerialized();

  afterEach(() => { vi.clearAllMocks()});

  it("returns existing category if found", async () => {
    vi.spyOn(db, "findCategoryByName").mockResolvedValue(categoryJSON as any);
    vi.spyOn(serializers, "serializeCategory").mockReturnValue(categorySerialized);
    vi.spyOn(service, "createCategory");

    const result = await getOrCreateCategory(USER_ID_STR, FOOD_CATEGORY_NAME);

    expect(db.findCategoryByName).toHaveBeenCalledOnce();
    expect(db.findCategoryByName).toHaveBeenCalledWith(FOOD_CATEGORY_NAME, USER_ID_STR);
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledWith(categoryJSON);
    expect(service.createCategory).not.toHaveBeenCalled();
    expect(result).toEqual(categorySerialized);
  });

  it("creates and returns new category if not found", async () => {
    vi.spyOn(db, "findCategoryByName").mockResolvedValue(null);
    vi.spyOn(serializers, "serializeCategory");
    vi.spyOn(service, "createCategory").mockResolvedValue(categorySerialized as any);

    const result = await getOrCreateCategory(USER_ID_STR, FOOD_CATEGORY_NAME);

    expect(db.findCategoryByName).toHaveBeenCalledOnce();
    expect(db.findCategoryByName).toHaveBeenCalledWith(FOOD_CATEGORY_NAME, USER_ID_STR);
    expect(serializers.serializeCategory).not.toHaveBeenCalled();
    expect(service.createCategory).toHaveBeenCalledOnce();
    expect(service.createCategory).toHaveBeenCalledWith(
      USER_ID_STR, { name: FOOD_CATEGORY_NAME}
    );
    expect(result).toEqual(categorySerialized);
  })

});
