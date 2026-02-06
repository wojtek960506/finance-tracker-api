import { describe, expect, it } from "vitest";
import { serializeCategory } from "./serialize-category";
import {
  getUserCategoryResultJSON,
  getUserCategoryResultSerialized,
} from "@/test-utils/factories/category";


describe("serializeCategory", () => {
  const categoryJSON = getUserCategoryResultJSON();
  const categoryResult = getUserCategoryResultSerialized();

  it("serialize category", () => {
    const result = serializeCategory(categoryJSON as any);
    expect(result).toEqual(categoryResult);
  });
});
