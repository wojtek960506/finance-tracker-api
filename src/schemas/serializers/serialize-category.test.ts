import { describe, expect, it } from "vitest";
import { serializeCategory } from "./serialize-category";
import {
  getUserCategoryResultJSON,
  getUserCategoryResultSerialized,
} from "@/test-utils/factories/category";


describe("serializeCategory", () => {
  const categoryJSON = getUserCategoryResultJSON();
  const categoryResult = getUserCategoryResultSerialized();

  const iCategory = {
    ...categoryJSON,
    toObject: () => ({ ...categoryJSON, __v: 1 }),
  }

  it("serialize category", () => {
    const result = serializeCategory(iCategory as any);
    expect(result).toEqual(categoryResult);
  });
});
