import { findTransaction } from "./find-transaction";
import { TransactionNotFoundError } from "@utils/errors";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { getStandardTransactionResultJSON } from "@/test-utils/mocks/transactions";


vi.mock("@models/transaction-model", () => ({ TransactionModel: { findById: vi.fn() } }));

describe("findTransaction", () => {
  const TRANSACTION_ID = "123"
  const transaction = getStandardTransactionResultJSON("234", 1, TRANSACTION_ID)

  afterEach(() => { vi.clearAllMocks(); });
  
  it("transaction exists", async () => {
    (TransactionModel.findById as Mock).mockResolvedValue(transaction);

    const result = await findTransaction(TRANSACTION_ID);

    expect(TransactionModel.findById).toHaveBeenCalledOnce();
    expect(TransactionModel.findById).toHaveBeenCalledWith(TRANSACTION_ID);
    expect(result).toEqual(transaction);
  })

  it("transaction does not exist", async () => {
    (TransactionModel.findById as Mock).mockResolvedValue(undefined);

    await expect(findTransaction(TRANSACTION_ID)).rejects.toThrow(TransactionNotFoundError);

    expect(TransactionModel.findById).toHaveBeenCalledOnce();
    expect(TransactionModel.findById).toHaveBeenCalledWith(TRANSACTION_ID);
  })
})