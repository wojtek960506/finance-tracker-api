import { startSession } from "mongoose";
import { FastifyInstance } from "fastify";
import { UserModel } from "@models/user-model";
import { validateBody } from "@utils/validation";
import { serializeUser } from "@schemas/serializers";
import { authorizeAccessToken } from "@services/auth";
import { AppError, NotFoundError } from "@utils/errors";
import { createUserHandler } from "./handlers/create-user";
import { TransactionModel } from "@models/transaction-model";
import { createRandomTransactions } from "./handlers/create-random-transactions";
import { AuthenticatedRequest, DeleteManyReply, ParamsJustId } from "../routes-types";
import {
  UserCreateDTO,
  UserResponseDTO,
  UsersResponseDTO,
  UserCreateSchema,
  TestUserCreateDTO,
  TestUserCreateSchema,
} from "@schemas/user";


export async function userRoutes(app: FastifyInstance) {
  
  app.get<{ Params: ParamsJustId, Reply: UsersResponseDTO }>(
    "/",
    async () => {
      const users = await UserModel.find().sort({ lastName: 1 });
      return users.map(u => serializeUser(u))
    }
  )

  app.get<{ Params: ParamsJustId, Reply: UserResponseDTO }>(
    "/:id",
    { preHandler: authorizeAccessToken() },
    async (req, res) => {
      const userId = (req as AuthenticatedRequest).userId;
      const { id } = req.params;
      if (userId !== id) {
        throw new AppError(401, "Cannot get info about different user.")
      }

      const user = await UserModel.findById(id);
      if (!user)
        throw new NotFoundError(`User with ID '${id}' not found`);

      return res.send(serializeUser(user));
    }
  )

  app.post<{ Body: UserCreateDTO, Reply: UserResponseDTO }>(
    "/",
    { preHandler: validateBody(UserCreateSchema) },
    async (req, res) => {
      const newUser = await createUserHandler(req);
      return res.code(201).send(newUser);
    }
  )

  app.post<{
    Body: TestUserCreateDTO,
    Reply: { userId: string, email: string, insertedTransactionsCount: number }
  }>(
    "/test",
    { preHandler: validateBody(TestUserCreateSchema) },
    async (req, res) => {
      const { username, totalTransactions } = req.body;
      const newBody = {
        firstName: username,
        lastName: username,
        email: `${username}@test.com`,
        password: '123',
      }

      const session = await startSession();
      try {
        await session.withTransaction(async () => {
          const { id: userId, email } = await createUserHandler(
            { ...req, body: newBody },
            session
          );

          const insertedTransactionsCount = await createRandomTransactions(
            userId,
            totalTransactions,
            session,
          );

          res.code(201).send({
            userId,
            email,
            insertedTransactionsCount
          });
        })
      } finally {
        session.endSession();
      }
    }
  )

  app.delete<{ Params: ParamsJustId, Reply: UserResponseDTO }>(
    "/:id",
    async (req, res) => {
      const { id } = req.params;
      const errorMessage = `User with ID '${id}' not found`;

      const user = await UserModel.findById(id);
      if (!user)
        throw new NotFoundError(errorMessage);

      const session = await startSession();

      try {
        await session.withTransaction(async () => {
          await TransactionModel.deleteMany({ ownerId: id }, { session });

          const { deletedCount } = await UserModel.deleteOne({ _id: id }, { session });
          if (deletedCount !== 1)
            throw new NotFoundError(errorMessage);
        })
      } finally {
        session.endSession();
      }

      return res.send(serializeUser(user));
    }
  )

  app.delete<{ Reply: DeleteManyReply }>("/", async (req, res) => {
    const tmp = await UserModel.deleteMany();
    return res.send(tmp);
  })
}
