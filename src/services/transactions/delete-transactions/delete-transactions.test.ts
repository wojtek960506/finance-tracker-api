
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserModel } from "@models/user-model";
import { deleteTransactions } from "./delete-transactions";
import { TransactionModel } from "@models/transaction-model";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { AppError } from "@utils/errors";


describe("deleteTransactions", () => {
  
  const deleteResult = { deletedCount: 100 }
  const testUserEmail = "test1@test.com";

  afterEach(() => { vi.clearAllMocks() });

  it("delete transactions for test user", async () => {
    vi.spyOn(UserModel, "findById").mockResolvedValue({ email: testUserEmail });
    vi.spyOn(TransactionModel, "deleteMany").mockResolvedValue(deleteResult as any);

    const result = await deleteTransactions(USER_ID_STR);
    expect(UserModel.findById).toHaveBeenCalledOnce();
    expect(UserModel.findById).toHaveBeenCalledWith(USER_ID_STR);
    expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
    expect(TransactionModel.deleteMany).toHaveBeenCalledWith({ ownerId: USER_ID_STR });
    expect(result).toEqual(deleteResult);
  });

  it("throws error when user other then testing one", async () => {
    vi.spyOn(UserModel, "findById").mockResolvedValue({ email: "someemail" });
    vi.spyOn(TransactionModel, "deleteMany");

    await expect(deleteTransactions(USER_ID_STR)).rejects.toThrow(AppError);
    expect(UserModel.findById).toHaveBeenCalledOnce();
    expect(UserModel.findById).toHaveBeenCalledWith(USER_ID_STR);
    expect(TransactionModel.deleteMany).not.toHaveBeenCalledOnce();
  });
});
