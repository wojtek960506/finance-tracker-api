import { describe, expect, it } from "vitest";
import { serializeCategory } from "./serialize-category";
import {
  getExchangeCategoryResultJSON,
  getExchangeCategoryResultSerialized,
  getUserCategoryResultJSON,
  getUserCategoryResultSerialized,
} from "@/test-utils/factories/category";


describe("serializeCategory", () => {
  const userCategoryJSON = getUserCategoryResultJSON();
  const userCategorySerialized = getUserCategoryResultSerialized();
  const iCategoryUser = {
    ...userCategoryJSON,
    toObject: () => ({ ...userCategoryJSON, __v: 1 }),
  }

  const systemCategoryJSON = getExchangeCategoryResultJSON();
  const systemCategorySerialized = getExchangeCategoryResultSerialized();
  const iCategorySystem = {
    ...systemCategoryJSON,
    toObject: () => ({ ...systemCategoryJSON, __v: 1 }),
  }

  it("serialize category with owner", () => {
    const result = serializeCategory(iCategoryUser as any);
    expect(result).toEqual(userCategorySerialized);
  });

  it("serialize category without owner", () => {
    const result = serializeCategory(iCategorySystem as any);
    expect(result).toEqual(systemCategorySerialized);
  });
});
