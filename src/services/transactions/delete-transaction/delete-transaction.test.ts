import { randomObjectIdString } from "@utils/random";
import { describe, expect, it, Mock, vi } from "vitest";
import { deleteTransaction } from "@services/transactions";
import { findTransaction, removeTransaction } from "@db/transactions";
import { OLD_getStandardTransactionResultJSON } from "@/test-utils/mocks/transactions";


vi.mock("@db/transactions", () => ({ findTransaction: vi.fn(), removeTransaction: vi.fn() }));

describe("deleteTransaction", () => {

  it("delete transaction", async () => {
    const [TRANSACTION_ID, OWNER_ID] = [randomObjectIdString(), randomObjectIdString()];
    const REMOVE_RESULT = { acknowledged: true, deletedCount: 1 };

    const transaction = OLD_getStandardTransactionResultJSON(OWNER_ID, 1, TRANSACTION_ID);
    (findTransaction as Mock).mockResolvedValue(transaction);
    (removeTransaction as Mock).mockResolvedValue(REMOVE_RESULT);

    const result = await deleteTransaction(TRANSACTION_ID, OWNER_ID);

    expect(findTransaction).toHaveBeenCalledOnce();
    expect(findTransaction).toHaveBeenCalledWith(TRANSACTION_ID);
    expect(removeTransaction).toHaveBeenCalledOnce();
    expect(removeTransaction).toHaveBeenCalledWith(transaction.id, undefined);
    expect(result).toEqual(REMOVE_RESULT);
  })
})