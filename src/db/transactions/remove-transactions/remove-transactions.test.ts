import { removeTransactions } from "./remove-transactions";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TransactionModel } from "@models/transaction-model";
import { USER_ID_STR } from "@/test-utils/factories/general";


describe("removeTransactions", () => {

  const deleteResult = { deletedCount: 100 };

  afterEach(() => { vi.clearAllMocks() });

  it.each([
    ["filter by `ownerId`", USER_ID_STR, { ownerId: USER_ID_STR }],
    ["do not filter", undefined, {}],
  ])("%s", async (_, ownerId, query) => {
    vi.spyOn(TransactionModel, "deleteMany").mockResolvedValue(deleteResult as any);

    const result = await removeTransactions(ownerId);

    expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
    expect(TransactionModel.deleteMany).toHaveBeenCalledWith(query);
    expect(result).toEqual(deleteResult);
  });
});
