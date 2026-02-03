import { describe, expect, it, vi } from "vitest";
import * as serializers from "@schemas/serializers";
import { saveCategoryChanges } from "@db/categories";
import { getUserCategoryResultJSON } from "@/test-utils/factories";


describe("saveCategoryChanges", () => {

  const save = vi.fn();
  const newProps = { name: "FooD 123", nameNormalized: "food 123" };
  const iCategory = { ...getUserCategoryResultJSON(), save };
  const updatedCategory = { ...iCategory, name: "FooD 123", nameNormalized: "food 123" };

  it("save category changes", async () => {
    vi.spyOn(serializers, "serializeCategory").mockReturnValue(updatedCategory as any);

    const result = await saveCategoryChanges(iCategory as any, newProps);

    expect(save).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledWith(updatedCategory);
    expect(result).toEqual(updatedCategory);
  });
});
