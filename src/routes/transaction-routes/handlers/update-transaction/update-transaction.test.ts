import { NotFoundError } from "@utils/errors";
import { TransactionModel } from "@models/transaction-model";
import { updateTransactionHandler } from "./update-transaction";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { serializeTransaction } from "@schemas/serialize-transaction";
import {
  generatePartialTransaction,
  generateFullStandardTransaction,
} from "@utils/__mocks__/transactionMock";


vi.mock("@models/transaction-model", () => ({
  TransactionModel: {
    findByIdAndUpdate: vi.fn(),
    findById: vi.fn(),
  }
}));

vi.mock("@schemas/serialize-transaction", () => ({
  serializeTransaction: vi.fn()
}));

const id = "1";
const fullBody = generateFullStandardTransaction();
const partialBody = generatePartialTransaction();


describe("updateTransactionHelper", () => {
  const req = { params: { id }, body: fullBody }
  const send = vi.fn();
  const res = { send, code: vi.fn(() => ({ send })) }
  
  beforeEach(() => { vi.clearAllMocks() })

  // TODO it has to be refactored as implementation of updateTransactionHandler was refactored
  // it("when properly updated it shoud send updated data", async () => {
  //   (TransactionModel.findById as Mock).mockResolvedValue({ ...fullBody });
  //   (serializeTransaction as Mock).mockReturnValue({ ...fullBody });

  //   await updateTransactionHandler(req as any);

  //   expect(res.code).not.toHaveBeenCalled();
  //   expect(send).toHaveBeenCalledTimes(1);
  //   expect(send).toHaveBeenCalledWith({ ...fullBody })
  // })

  it ("when some problem with update it should throw an error", async () => {
    (TransactionModel.findById as Mock).mockResolvedValue(undefined);

    try {
      await updateTransactionHandler(req as any);
      throw new Error("Expected `updateTransactionHelper` to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      expect((error as NotFoundError).statusCode).toBe(404);
      expect(error).toHaveProperty("message");
    }
  })

})