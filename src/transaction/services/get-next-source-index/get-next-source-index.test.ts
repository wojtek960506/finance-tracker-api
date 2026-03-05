import { CounterModel } from "@models/counter-model";
import { describe, expect, it, Mock, vi } from "vitest";
import { getNextSourceIndex } from "./get-next-source-index";


vi.mock("@models/counter-model", () => ({
  CounterModel: {
    findOneAndUpdate: vi.fn(),
  }
}));

describe("getNextSourceIndex", async () => {
  it("should return next source index", async () => {
    (CounterModel.findOneAndUpdate as Mock).mockResolvedValue({ seq: 1 });
    const USER_ID = "123";

    const nextSourceIndex = await getNextSourceIndex(USER_ID);

    expect(CounterModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(CounterModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: { type: "transactions", userId: USER_ID } },
      { $inc: { seq: 1 } },
      {
        upsert: true,
        returnDocument: "after"
      }
    )
    expect(nextSourceIndex).toBe(1);
  })
})