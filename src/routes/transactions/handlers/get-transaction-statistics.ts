import { TransactionModel } from "@models/transaction-model";
import { AuthenticatedRequest } from "@routes/types";
import { transactionStatisticsQuerySchema } from "@schemas/transaction-query";
import { ValidationError } from "@utils/errors";
import { validateSchema } from "@utils/validation";
import { FastifyReply, FastifyRequest } from "fastify";
import { FilterQuery, PipelineStage, Types } from "mongoose";

export async function getTransactionStatisticsHandler(req: FastifyRequest, _res: FastifyReply) {
  const q = validateSchema(transactionStatisticsQuerySchema, req.query);

  if (!q.year && !q.month) {
    throw new ValidationError(
      "At least one of 'year' or 'month' has to be specified to get statistics"
    )
  }

  const matching: FilterQuery<unknown> = {};
  if (q.year && !q.month) {
    matching.date = {
      $gte: new Date(`${q.year}/01/01`),
      $lt: new Date(`${q.year + 1}/01/01`)
    };
  }
  if (q.month && !q.year) matching.$expr = { $eq: [{ $month: "$date" }, q.month]};
  if (q.month && q.year) {
    matching.date = {
      $gte: new Date(`${q.year}/${String(q.month).padStart(2, "0")}/01`),
      $lt: new Date(
        `${q.month === 12 ? q.year + 1 : q.year}/` + 
        `${String(q.month === 12 ? 1 : q.month + 1).padStart(2, "0")}/01`
      )
    }
  }
  
  matching.ownerId = new Types.ObjectId((req as AuthenticatedRequest).userId);
  matching.transactionType = q.transactionType;
  matching.currency = q.currency;

  if (q.category) matching.category = q.category;
  if (q.paymentMethod) matching.paymentMethod = q.paymentMethod;
  if (q.account) matching.account = q.account;

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

  const result = await TransactionModel.aggregate([
    { $match: matching } as PipelineStage,
    grouping as PipelineStage
  ])

  return result
}