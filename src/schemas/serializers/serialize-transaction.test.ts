import { describe, expect, it } from "vitest";
import { serializeTransaction } from "@schemas/serializers";
import {
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
} from "@/test-utils/factories/transaction";


describe("serializeTransaction", () => {
  const transaction = getStandardTransactionResultJSON()
  const iTransaction = {
    ...transaction,
    toObject: () => ({ ...transaction, __v: 1 })
  }
  const transactionSerialized = getStandardTransactionResultSerialized();

  it("serialize transaction", () => {
    const result = serializeTransaction(iTransaction as any);
    expect(result).toEqual(transactionSerialized);
  });
});
