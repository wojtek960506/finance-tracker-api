import { randomObjectIdString } from "@utils/random";
import { describe, expect, it, Mock, vi } from "vitest";
import { getTransactionTotals } from "./get-transaction-totals";
import {
  TOTALS_OVERALL,
  TOTALS_BY_CURRENCY,
  PARSED_TOTALS_OVERALL,
  PARSED_TOTALS_BY_CURRENCY,
} from "./mocks";
import {
  findTransactionTotalsOverall,
  findTransactionTotalsByCurrency,
} from "@db/transactions";


vi.mock("@db/transactions", () => ({
  findTransactionTotalsOverall: vi.fn(),
  findTransactionTotalsByCurrency: vi.fn(),
}));

describe("getTransactionTotals", () => {
  
  it("get transaction totals", async () => {
    (findTransactionTotalsByCurrency as Mock).mockResolvedValue(TOTALS_BY_CURRENCY);
    (findTransactionTotalsOverall as Mock).mockResolvedValue(TOTALS_OVERALL);

    const result = await getTransactionTotals({ category: "food" }, randomObjectIdString());

    expect(findTransactionTotalsByCurrency).toHaveBeenCalledOnce();
    expect(findTransactionTotalsOverall).toHaveBeenCalledOnce();
    expect(result).toEqual({
      overall: PARSED_TOTALS_OVERALL,
      byCurrency: PARSED_TOTALS_BY_CURRENCY,
    })
  })
})