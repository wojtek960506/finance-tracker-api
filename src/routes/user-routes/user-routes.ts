import { startSession } from "mongoose";
import { FastifyInstance } from "fastify";
import { NotFoundError } from "@utils/errors";
import { UserModel } from "@models/user-model";
import { validateBody } from "@utils/validation";
import { serializeUser } from "@schemas/serializers";
import { authorizeAccessToken } from "@services/auth";
import { TransactionModel } from "@models/transaction-model";
import { DeleteManyReply, ParamsJustId } from "../routes-types";
import {
  getUserHandler,
  getUsersHandler,
  createUserHandler,
  createTestUserHandler,
} from "./handlers";
import {
  UserCreateDTO,
  UserResponseDTO,
  UsersResponseDTO,
  UserCreateSchema,
  TestUserCreateDTO,
  TestUserCreateSchema,
  TestUserCreateResponseDTO,
} from "@schemas/user";


export async function userRoutes(app: FastifyInstance) {
  
  app.get<{ Reply: UsersResponseDTO }>("/", getUsersHandler);

  app.get<{ Params: ParamsJustId, Reply: UserResponseDTO }>(
    "/:id", 
    { preHandler: authorizeAccessToken() },
    getUserHandler,
  );

  app.post<{ Body: UserCreateDTO, Reply: UserResponseDTO }>(
    "/",
    { preHandler: validateBody(UserCreateSchema) },
    createUserHandler,
  )

  app.post<{ Body: TestUserCreateDTO, Reply: TestUserCreateResponseDTO }>(
    "/test",
    { preHandler: validateBody(TestUserCreateSchema) },
    createTestUserHandler,
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
