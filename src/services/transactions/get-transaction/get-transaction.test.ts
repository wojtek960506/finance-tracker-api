import { findTransaction } from "@db/transactions";
import { randomObjectIdString } from "@utils/random";
import { describe, expect, it, Mock, vi } from "vitest";
import { getTransaction } from "@services/transactions";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { getStandardTransactionResultJSON } from "@/test-utils/mocks/transactions";


vi.mock("@db/transactions", () => ({ findTransaction: vi.fn() }));
vi.mock("@schemas/serialize-transaction", () => ({ serializeTransaction: vi.fn() }));

describe("getTransaction", () => {
  it("get transaction", async () => {
    const [TRANSACTION_ID, OWNER_ID] = randomObjectIdString();
    const transaction = getStandardTransactionResultJSON(OWNER_ID, 1, TRANSACTION_ID);
    (findTransaction as Mock).mockResolvedValue(transaction);
    (serializeTransaction as Mock).mockReturnValue(transaction);

    const result = await getTransaction(TRANSACTION_ID, OWNER_ID);

    expect(findTransaction).toHaveBeenCalledOnce();
    expect(findTransaction).toHaveBeenCalledWith(TRANSACTION_ID);
    expect(serializeTransaction).toHaveBeenCalledOnce();
    expect(serializeTransaction).toHaveBeenCalledWith(transaction);
    expect(result).toEqual(transaction);
  })
})