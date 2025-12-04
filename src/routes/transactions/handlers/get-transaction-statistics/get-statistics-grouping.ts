import { TransactionStatisticsQuery } from "@schemas/transaction-query";
import { PipelineStage } from "mongoose";

export const getStatisticsGrouping = (q: TransactionStatisticsQuery) => {
  let grouping = {};

  // grouping by year and month (then we get all statistics
  // from a given month of the given year)
  if (q.year && q.month) {
    grouping = {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalItems: { $sum: 1 },
      }
    }
  }

  // grouping just by year (then we get all statistics
  // from given year and grouped by month in a given year)
  if (q.year && !q.month) {
    grouping = {
      $facet: {
        allTimeByYear: [{
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalItems: { $sum: 1 },
          }
        }],
        monthly: [{
          $group: {
            _id: { month: { $month: "$date" } },
            totalAmount: { $sum: "$amount" },
            totalItems: { $sum: 1 },
          }
        }, {
          $sort: { "_id.month": 1 } // ascending numbers of months
        }]
      }
    }
  }

  // grouping just by a month (then we get all time statistics
  // for month and grouped by a year)
  if (q.month && !q.year) {
    grouping = {
      $facet: {
        allTimeByMonth: [{
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount"},
            totalItems: { $sum: 1 },
          }
        }],
        yearly: [{
          $group: {
            _id: { year: { $year: "$date" } },
            totalAmount: { $sum: "$amount" },
            totalItems: { $sum: 1 },
          }
        }, {
          $sort: { "_id.year": 1 } // ascending numbers of years
        }]
      }
    }
  }

  return grouping as PipelineStage;
}