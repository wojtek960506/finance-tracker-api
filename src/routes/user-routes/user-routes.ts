import { FastifyInstance } from "fastify";
import { UserModel } from "@models/user-model";
import { validateBody } from "@utils/validation";
import { AppError, NotFoundError } from "@utils/errors";
import { serializeUser } from "@schemas/serialize-user";
import { createUserHandler } from "./handlers/create-user";
import { authorizeAccessToken } from "@/services/authorization";
import { createRandomTransactions } from "./handlers/create-random-transactions";
import { AuthenticatedRequest, DeleteManyReply, ParamsJustId } from "../routes-types";
import {
  TestUserCreateSchema,
  TestUserCreateDTO,
  UserCreateDTO,
  UserCreateSchema,
  UserResponseDTO,
  UsersResponseDTO
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
      const newUser = await createUserHandler(req, res);
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

      // TODO probably those 2 operations should be in one session to avoid situation when
      // user is created but there is some error when adding transactions

      const { id: userId, email } = await createUserHandler({ ...req, body: newBody }, res);

      const insertedTransactionsCount = await createRandomTransactions(userId, totalTransactions);
      res.code(201).send({
        userId,
        email,
        insertedTransactionsCount
      });
    }
  )

  app.delete<{ Params: ParamsJustId, Reply: UserResponseDTO }>(
    "/:id",
    async (req, res) => {
      const { id } = req.params;
      // TODO - before deleting user, delete all of its transactions
      const deleted = await UserModel.findByIdAndDelete(id);
      if (!deleted)
        throw new NotFoundError(`User with ID '${id}' not found`);
      return res.send(serializeUser(deleted));
    }
  )

  app.delete<{ Reply: DeleteManyReply }>("/", async (req, res) => {
    const tmp = await UserModel.deleteMany();
    return res.send(tmp);
  })
}