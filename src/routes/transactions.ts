import { FastifyInstance } from "fastify";
import { TransactionModel } from "@models/transaction-model";
import { 
  TransactionCreateDTO,
  TransactionCreateSchema,
  TransactionPatchDTO,
  TransactionPatchSchema,
  TransactionUpdateDTO,
  TransactionUpdateSchema,
  TransactionResponseDTO,
  TransactionsResponseDTO,
} from "@schemas/transaction";
import { AuthenticatedRequest, DeleteManyReply, FilteredResponse, ParamsJustId } from "./types";
import { updateTransactionHelper } from "@utils/routes";
import { validateBody, validateSchema } from "@utils/validation";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { authorizeAccessToken } from "@/services/authorization";
import { checkOwner, findTransaction } from "./utils-routes";
import { 
  transactionAnalysisQuerySchema,
  transactionQuerySchema,
  transactionStatisticsQuerySchema
} from "@schemas/transaction-query";
import { buildTransactionQuery } from "@/services/build-transaction-query";
import { buildTransactionAnalysisQuery } from "@/services/build-transaction-analysis-query";
import { FilterQuery, PipelineStage, Types } from "mongoose";
import { ValidationError } from "@utils/errors";

export async function transactionRoutes(
  app: FastifyInstance & { withTypeProvider: <T>() => any }
) {

  app.get<{ Reply: FilteredResponse<TransactionsResponseDTO> }>(
    "/",
    { preHandler: authorizeAccessToken() },
    async (req, res) => {
      const q = validateSchema(transactionQuerySchema, req.query);

      const filter = buildTransactionQuery(q, (req as AuthenticatedRequest).userId);
      const skip = (q.page - 1) * q.limit;

      const [transactions, total] = await Promise.all([
        TransactionModel
          .find(filter)
          .sort({ [q.sortBy]: q.sortOrder === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(q.limit),
        TransactionModel.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / q.limit);

      return res.send({
        page: q.page,
        limit: q.limit,
        total,
        totalPages,
        items: transactions.map(transaction => serializeTransaction(transaction))
      })
    }
  );

  app.get< { Reply: { totalAmount: number, totalItems: number }} >(
    "/analysis",
    { preHandler: authorizeAccessToken() },
    async (req, _res) => {
      const q = validateSchema(transactionAnalysisQuerySchema, req.query);
      const filter = buildTransactionAnalysisQuery(q, (req as AuthenticatedRequest).userId);
      const result = await TransactionModel.aggregate([
        { $match: filter },
        { $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalItems: { $sum: 1 },
        }}
      ])
      return {
        totalAmount: result[0]!.totalAmount,
        totalItems: result[0]!.totalItems,
      }
    }
  )


  // it is possible to group by
  // - just month (then we get all time statistics for month and grouped by a year)
  // - just year (then we get all statistics from given year and grouped by month in a given year)
  // - year and month - then we get all statistics from a given month of the given year

  // additionally we can filter it by category or payment method or account

  app.get(
    "/statistics",
    { preHandler: authorizeAccessToken() },
    async (req, _res) => {
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
  )


  app.get<{ Params: ParamsJustId; Reply: TransactionResponseDTO }>(
    "/:id",
    async (req) => {
      const transaction = await findTransaction(req.params.id);
      return serializeTransaction(transaction);
    }
  )

  app.post<{ Body: TransactionCreateDTO; Reply: TransactionResponseDTO }>(
    "/",
    { 
      preHandler: [
        validateBody(TransactionCreateSchema),
        authorizeAccessToken(),
      ]
    },
    async (req, res) => {
      const newTransaction = await TransactionModel.create({
        ...req.body,
        ownerId: (req as AuthenticatedRequest).userId
      })
      res.code(201).send(serializeTransaction(newTransaction));
    }
  );

  app.put<{ 
    Params: ParamsJustId;
    Body: TransactionUpdateDTO;
    Reply: TransactionResponseDTO
  }>(
    "/:id",
    {
      preHandler: [
        validateBody(TransactionUpdateSchema),
        authorizeAccessToken(),
      ]
    },
    (req) => updateTransactionHelper(req)
  );

  app.patch<{
    Params: ParamsJustId;
    Body: TransactionPatchDTO;
    Reply: TransactionResponseDTO
  }>(
    "/:id",
    { 
      preHandler: [
        validateBody(TransactionPatchSchema),
        authorizeAccessToken()
      ]
    },
    (req) => updateTransactionHelper(req)
  );

  app.delete<{
    Params: ParamsJustId,
    Reply: TransactionResponseDTO
  }>(
    "/:id",
    { preHandler: authorizeAccessToken() },
    async (req) => {
      const { id } = req.params;
      const transaction = await findTransaction(id);
  
      checkOwner((req as AuthenticatedRequest).userId, transaction, "delete");

      await transaction.deleteOne();
      return serializeTransaction(transaction);
    }
  )

  app.delete<{ Reply: DeleteManyReply }>("/", async (_req, res) => {
    const tmp = await TransactionModel.deleteMany();
    return res.send(tmp);
  })
}
