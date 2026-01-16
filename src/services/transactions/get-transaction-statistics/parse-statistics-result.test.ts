import { parseStatisticsResult } from "./parse-statistics-result";
import { describe, expect, it } from "vitest";

describe("parseStatisticsResults", () => {

  it.each(
    [["undefined", undefined], ["empty", []]]
  )("when result is '%s'", (_title, result) => {
    const parsedData = parseStatisticsResult(result, {} as any)

    expect(parsedData).toEqual({ totalAmount: 0, totalItems: 0 });
  })

  it("when year and month is present in filter", () => {
    const data = { totalAmount: 500, totalItems: 20 }
    const result = [data];

    const parsedData = parseStatisticsResult(result, { year: 2000, month: 10 });

    expect(parsedData).toEqual(data);

  })
})