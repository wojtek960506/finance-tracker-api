import { describe, expect, it } from "vitest";
import {
  TOTALS_OVERALL,
  TOTALS_BY_CURRENCY,
  PARSED_TOTALS_OVERALL,
  PARSED_TOTALS_BY_CURRENCY,
} from "./mocks";
import {
  parseTotalsOverallResult,
  parseTotalsByCurrencyResult,
} from "./parse-totals-result";


describe("parse totals result", () => {

  it("parseTotalsOverallResult", () => {
    const result = parseTotalsOverallResult(TOTALS_OVERALL);
    expect(result).toEqual(PARSED_TOTALS_OVERALL);
  });

  it("parseTotalsByCurrencyResult", () => {
    const result = parseTotalsByCurrencyResult(TOTALS_BY_CURRENCY);
    expect(result).toEqual(PARSED_TOTALS_BY_CURRENCY);
  });
})