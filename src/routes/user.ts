import { UserCreateDTO, UserCreateSchema, UserResponseDTO, UsersResponseDTO } from "@schemas/user";
import { FastifyInstance } from "fastify";
import { AuthenticatedRequest, ParamsJustId } from "./types";
import { UserModel } from "@models/User";
import { AppError, NotFoundError } from "@utils/errors";
import { validateBody } from "@utils/validation";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { getNotSensitiveUser } from "@utils/get-not-sensitive-user";
import { authorizeAccessToken } from "@utils/authorization";


export async function userRoutes(app: FastifyInstance) {
  
  app.get<{ Params: ParamsJustId, Reply: UsersResponseDTO }>(
    "/",
    async () => {
      const users = await UserModel.find().sort({ lastName: 1 });
      return users.map(u => getNotSensitiveUser(u))
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

      return res.send(getNotSensitiveUser(user));
    }
  )

  app.post<{ Body: UserCreateDTO, Reply: UserResponseDTO }>(
    "/",
    { preHandler: validateBody(UserCreateSchema) },
    async (req, res) => {
      const { password, ...rest } = req.body;
      const passwordHash1 = await argon2.hash(password);
      const newUser = await UserModel.create({
        ...rest,
        passwordHash: passwordHash1,
      });
      res.code(201).send(getNotSensitiveUser(newUser));
    }
  )

  app.delete<{ Params: ParamsJustId, Reply: UserResponseDTO }>(
    "/:id",
    async (req, res) => {
      const { id } = req.params;
      const deleted = await UserModel.findByIdAndDelete(id);
      if (!deleted)
        throw new NotFoundError(`User with ID '${id}' not found`);
      return res.send(getNotSensitiveUser(deleted));
    }
  )

  app.delete<{ Reply:{ acknowledged: boolean, deletedCount: number } }>(
    "/",
    async (req, res) => {
      const tmp = await UserModel.deleteMany();
      return res.send(tmp);
    }
  )
}