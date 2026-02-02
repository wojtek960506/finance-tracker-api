import { describe, expect, it } from "vitest";
import { checkOwner, CheckOwnerType } from "./check-owner";
import { CategoryOwnershipError, TransactionOwnershipError } from "@utils/errors";


describe("checkOwner", () => {

  it("nothing returned when owner is the same as in transaction", () => {
    const result = checkOwner("1", "1", "1", "transaction");
    expect(result).toBeUndefined();
  });

  it.each([
    ["transaction", TransactionOwnershipError],
    ["category", CategoryOwnershipError]
  ])("throws error when owner is different than in %s", (type, error) => {
    expect(() => checkOwner("1", "2", "3", type as CheckOwnerType)).toThrow(error);
  });
});
