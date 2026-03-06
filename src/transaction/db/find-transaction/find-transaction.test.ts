import { findTransaction } from "./find-transaction"
import { TransactionModel } from "@transaction/model"
import { TransactionNotFoundError } from "@utils/errors"
import { it, vi, Mock, expect, describe, afterEach } from "vitest"
import {
  STANDARD_TXN_ID_STR,
  getStandardTransactionResultJSON,
} from "@/test-utils/factories/transaction"


vi.mock("@transaction/model", () => ({ TransactionModel: { findById: vi.fn() } }));

describe("findTransaction", () => {
  const transaction = getStandardTransactionResultJSON();

  afterEach(() => { vi.clearAllMocks(); });
  
  it("transaction exists", async () => {
    (TransactionModel.findById as Mock).mockResolvedValue(transaction);

    const result = await findTransaction(STANDARD_TXN_ID_STR);

    expect(TransactionModel.findById).toHaveBeenCalledOnce();
    expect(TransactionModel.findById).toHaveBeenCalledWith(STANDARD_TXN_ID_STR);
    expect(result).toEqual(transaction);
  })

  it("transaction does not exist", async () => {
    (TransactionModel.findById as Mock).mockResolvedValue(undefined);

    await expect(findTransaction(STANDARD_TXN_ID_STR)).rejects.toThrow(TransactionNotFoundError);

    expect(TransactionModel.findById).toHaveBeenCalledOnce();
    expect(TransactionModel.findById).toHaveBeenCalledWith(STANDARD_TXN_ID_STR);
  });
});
