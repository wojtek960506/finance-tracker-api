import { findTransaction } from "@transaction/db";
import { describe, expect, it, Mock, vi } from "vitest";
import { getTransaction } from "@transaction/services";
import { serializeTransaction } from "@transaction/serializers";
import { USER_ID_STR } from "@/test-utils/factories/general";
import {
  STANDARD_TXN_ID_STR,
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
} from "@/test-utils/factories/transaction";


vi.mock("@transaction/db", () => ({ findTransaction: vi.fn() }));
vi.mock("@transaction/serializers", () => ({ serializeTransaction: vi.fn() }));

describe("getTransaction", () => {
  it("get transaction", async () => {
    const populateMock = vi.fn();
    const transaction = {
      ...getStandardTransactionResultJSON(),
      populate: populateMock,
    };
    const transactionSerialized = getStandardTransactionResultSerialized();

    (findTransaction as Mock).mockResolvedValue(transaction);
    (serializeTransaction as Mock).mockReturnValue(transactionSerialized);


    const result = await getTransaction(STANDARD_TXN_ID_STR, USER_ID_STR);

    expect(findTransaction).toHaveBeenCalledOnce();
    expect(findTransaction).toHaveBeenCalledWith(STANDARD_TXN_ID_STR);
    expect(serializeTransaction).toHaveBeenCalledOnce();
    expect(serializeTransaction).toHaveBeenCalledWith(transaction);
    expect(result).toEqual(transactionSerialized);
  })
});
