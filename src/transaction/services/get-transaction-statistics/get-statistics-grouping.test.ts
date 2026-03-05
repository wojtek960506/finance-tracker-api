import { describe, expect, it } from "vitest";
import { getStatisticsGrouping } from "./get-statistics-grouping";


const getCommonGrouping = (_id: unknown) => ({
  _id,
  totalAmount: { $sum: "$amount" },
  totalItems: { $sum: 1 } 
})

describe("getStatisticsGrouping", () => {
  it("group by year and month", () => {
    const query = { year: 2025, month: 5 }
    
    const result = getStatisticsGrouping(query);

    expect(result).toEqual({ $group: getCommonGrouping(null) })
  });

  it("group by year and not by month", () => {
    const query = { year: 2025 }
    
    const result = getStatisticsGrouping(query);

    expect(result).toEqual({
      $facet: {
        allTime: [{ $group: getCommonGrouping(null) }],
        monthly: [
          { $group: getCommonGrouping({ month: { $month: "$date" } }) },
          { $sort: { "_id.month": 1 } }
        ]
      }
    })
  })

  it.each(
    [ ["present", 5], ["not present", undefined] ]
  )("group when year is not present (month %s)", (_title, month) => {
    const query = { month };

    const result = getStatisticsGrouping(query);

    expect(result).toEqual({
      $facet: {
        allTime: [{ $group: getCommonGrouping(null)}],
        yearly: [
          { $group: getCommonGrouping({ year: { $year: "$date" } }) },
          { $sort: { "_id.year": 1 } }
        ]
      }
    })
  })
})