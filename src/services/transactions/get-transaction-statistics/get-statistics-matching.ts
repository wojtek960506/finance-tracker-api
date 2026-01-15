import { FilterQuery, Types } from "mongoose";
import { ValidationError } from "@utils/errors";
import { TransactionStatisticsQuery } from "@schemas/transaction-query";



export const getStatisticsMatching = (q: TransactionStatisticsQuery, userId: string) => {
  if (q.category && q.excludeCategories) {
    throw new ValidationError(
      `'category' and 'excludeCategories' cannot be provided together in query`
    );
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
  
  matching.ownerId = new Types.ObjectId(userId);
  matching.transactionType = q.transactionType;
  matching.currency = q.currency;

  if (q.category) matching.category = q.category;
  if (q.excludeCategories) matching.category = { $nin: q.excludeCategories }
  if (q.paymentMethod) matching.paymentMethod = q.paymentMethod;
  if (q.account) matching.account = q.account;

  return matching;
}