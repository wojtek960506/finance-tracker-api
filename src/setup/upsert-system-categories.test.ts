import { withSession } from "@utils/with-session";
import { CategoryModel } from "@models/category-model";
import { upsertSystemCategories } from "./upsert-system-categories";
import { afterEach, describe, expect, it, vi } from "vitest";


const sessionMock = {} as any;

vi.mock("@utils/with-session", () => ({
  withSession: vi.fn().mockImplementation(
    async (func, ...args) => await func(sessionMock, ...args)
  ),
}));

describe("upsertSystemCategories", () => {
  afterEach(() => { vi.clearAllMocks() });

  it("delegates to withSession", async () => {
    vi.spyOn(CategoryModel, "updateOne").mockResolvedValue({} as any);

    await upsertSystemCategories();

    expect(withSession).toHaveBeenCalledOnce();
  });

  it("upserts all expected system categories", async () => {
    vi.spyOn(CategoryModel, "updateOne").mockResolvedValue({} as any);

    await upsertSystemCategories();

    expect(CategoryModel.updateOne).toHaveBeenCalledTimes(2);
    expect(CategoryModel.updateOne).toHaveBeenNthCalledWith(
      1,
      { type: "system", name: "exchange", nameNormalized: "exchange" },
      { $setOnInsert: { type: "system", name: "exchange", nameNormalized: "exchange" } },
      { upsert: true, session: sessionMock },
    );
    expect(CategoryModel.updateOne).toHaveBeenNthCalledWith(
      2,
      { type: "system", name: "myAccount", nameNormalized: "myaccount" },
      { $setOnInsert: { type: "system", name: "myAccount", nameNormalized: "myaccount" } },
      { upsert: true, session: sessionMock },
    );
  });
});
