import { describe, expect, it } from "vitest";
import { parseStatisticsResult } from "./parse-statistics-result";


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
  });

  it ("when year is present and month is not present in filter", () => {
    const result = [{
      allTime: [{ totalAmount: 10, totalItems: 5 }],
      monthly: [
        { _id: { month: 1 }, totalAmount: 4, totalItems: 2 },
        { _id: { month: 2 }, totalAmount: 6, totalItems: 3 },
      ]
    }]
    const parsedResult = parseStatisticsResult(result, { year: 2001 });

    expect(parsedResult).toEqual({
      allTime: { totalAmount: 10, totalItems: 5 },
      monthly: { 
        1: { totalAmount: 4, totalItems: 2 },
        2: { totalAmount: 6, totalItems: 3 },
      }
    })
  });

  it("when year is not present", () => {
    const result = [{
      allTime: [{ totalAmount: 10, totalItems: 5 }],
      yearly: [
        { _id: { year: 2002 }, totalAmount: 4, totalItems: 2 },
        { _id: { year: 2003 }, totalAmount: 6, totalItems: 3 },
      ]
    }]
    const parsedResult = parseStatisticsResult(result, { month: 5 });

    expect(parsedResult).toEqual({
      allTime: { totalAmount: 10, totalItems: 5 },
      yearly: { 
        2002: { totalAmount: 4, totalItems: 2 },
        2003: { totalAmount: 6, totalItems: 3 },
      }
    })
  });

  it("when year is present and month is not present and there is no data", () => {
    const result = [{ allTime: [], monthly: [] }];

    const parsedResult = parseStatisticsResult(result, { year: 2004 });

    expect(parsedResult).toEqual({
      "allTime": { "totalAmount": 0, "totalItems": 0 },
      "monthly": {}
    });
  })
})