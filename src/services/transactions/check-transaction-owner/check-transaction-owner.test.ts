import { describe, expect, it } from "vitest";
import { TransactionOwnershipError } from "@utils/errors";
import { checkTransactionOwner } from "./check-transaction-owner";


describe("checkTransactionOwner", () => {

  it("nothing returned when owner is the same as in transaction", () => {
    const result = checkTransactionOwner("1", "1", "1");
    expect(result).toBeUndefined();
  });

  it("throws error when owner is different than in transaction", () => {
    expect(() => checkTransactionOwner("1", "2", "3")).toThrow(TransactionOwnershipError);
  });
})