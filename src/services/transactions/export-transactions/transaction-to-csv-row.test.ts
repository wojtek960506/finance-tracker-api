import { describe, it, expect } from "vitest";
import { transactionToCsvRow } from "./transaction-to-csv-row";
import { OLD_getStandardTransactionResultJSON } from "@/test-utils/mocks/transactions";


describe("transactionToCsvRow", () => {
  const { ownerId, date, id, ...transaction } = OLD_getStandardTransactionResultJSON("1", 1, "1");
  const iTransaction = { ...transaction, _id: id, date: new Date(date) };

  it("transaction to csv row", () => {
    const result = transactionToCsvRow(iTransaction as any);

    expect(result).toEqual({
      ...transaction,
      date: date.slice(0, 10),
      currencies: undefined,
      exchangeRate: undefined,
      sourceRefIndex: undefined,
    });
  })
})