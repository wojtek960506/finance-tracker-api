import { PipelineStage } from "mongoose";
import { TransactionStatisticsQuery } from "@schemas/transaction-query";


const groupingByYear = { year: { $year: "$date" } } as const;
type TGroupingByYear = typeof groupingByYear;

const groupingByMonth = { month: { $month: "$date" } } as const;
type TGroupingByMonth = typeof groupingByMonth;

export const getAmountAndItemsGrouping = (
  _id: TGroupingByYear | TGroupingByMonth | null
) => ({
  _id,
  totalAmount: { $sum: "$amount" },
  totalItems: { $sum: 1 } 
} as const);

export const getStatisticsGrouping = (q: TransactionStatisticsQuery) => {
  let grouping = {};

  if (q.year) {
    if (q.month) {
      grouping = {
        $group: getAmountAndItemsGrouping(null)
      }
    } else {
      grouping = {
        $facet: {
          allTime: [{
            $group: getAmountAndItemsGrouping(null)
          }],
          monthly: [{
            $group: getAmountAndItemsGrouping(groupingByMonth)
          }, {
            $sort: { "_id.month": 1 } // ascending numbers of months
          }]
        }
      }
    }
  } else {
    grouping = {
      $facet: {
        allTime: [{
          $group: getAmountAndItemsGrouping(null)
        }],
        yearly: [{
          $group: getAmountAndItemsGrouping(groupingByYear)
        }, {
          $sort: { "_id.year": 1 } // ascending numbers of years
        }]
      }
    }
  }

  return grouping as PipelineStage;
}