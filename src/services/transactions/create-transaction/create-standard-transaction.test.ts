import { randomObjectIdString } from "@utils/random";
import { describe, expect, it, Mock, vi } from "vitest";
import { getNextSourceIndex } from "@services/transactions";
import { createStandardTransaction } from "./create-standard-transaction";
import { persistTransaction } from "@db/transactions/persist-transaction";
import {
  getTransactionCreateStandardDTO,
  getStandardTransactionResultJSON,
} from "@/test-utils/mocks/transactions";


vi.mock("@services/transactions/get-next-source-index", () => ({
  getNextSourceIndex: vi.fn(),
}));

vi.mock("@db/transactions/persist-transaction/persist-transaction", () => ({
  persistTransaction: vi.fn(),
}));

describe("createStandardTransaction", async () => {
  it("should create standard transaction", async () => {
    const [TRANSACTION_ID, OWNER_ID] = [randomObjectIdString(), randomObjectIdString()];
    const TRANSACTION_SOURCE_INDEX = 1;
    const dto = getTransactionCreateStandardDTO();
    const transaction = getStandardTransactionResultJSON(
      OWNER_ID, TRANSACTION_SOURCE_INDEX, TRANSACTION_ID
    );
    (persistTransaction as Mock).mockResolvedValue(transaction);
    (getNextSourceIndex as Mock).mockResolvedValue(TRANSACTION_SOURCE_INDEX);

    const result = await createStandardTransaction(dto, OWNER_ID);

    expect(persistTransaction).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledWith(OWNER_ID);
    expect(result).toEqual(transaction);
  });
})