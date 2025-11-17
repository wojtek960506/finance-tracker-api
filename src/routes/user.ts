import { UserCreateDTO, UserCreateSchema, UserResponseDTO, UsersResponseDTO } from "@schemas/user";
import { FastifyInstance } from "fastify";
import { ParamsJustId } from "./types";
import { UserModel } from "@models/User";
import { AppError, NotFoundError } from "@utils/errors";
import { validateBody } from "@utils/validation";
import argon2 from "argon2";
import jwt from "jsonwebtoken";


export async function userRoutes(app: FastifyInstance) {
  
  app.get<{ Params: ParamsJustId, Reply: UsersResponseDTO }>(
    "/",
    async () => {
      return await UserModel.find().sort({ lastName: 1 });
    }
  )

  app.get<{ Params: ParamsJustId, Reply: UserResponseDTO }>(
    "/:id",
    async (req, res) => {

      // TODO - add some helper to check authentication
      // rename authorization to authenticateion as I messed up with those words
      // // get authorization header
      // const authHeader = req.headers.authorization;
      // if (!authHeader?.startsWith("Bearer ")) {
      //   throw new AppError(401, "Missing token");
      // }

      // const token = authHeader.split(" ")[1];
      
      // console.log('token', token)

      // try {
      //   jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
      // } catch {
      //   throw new AppError(401, "Invalid or expired token");
      // }

      const { id } = req.params;
      const user = await UserModel.findById(id);
      if (!user)
        throw new NotFoundError(`User with ID '${id}' not found`);

      return user;
    }
  )

  app.post<{ Body: UserCreateDTO, Reply: UserResponseDTO }>(
    "/",
    { preHandler: validateBody(UserCreateSchema) },
    async (req, res) => {
      const { password, ...rest } = req.body;
      const passwordHash = await argon2.hash(password);
      const newUser = await UserModel.create({
        ...rest,
        passwordHash
      });
      res.code(201).send(newUser);
    }
  )

  app.delete<{ Params: ParamsJustId, Reply: UserResponseDTO }>(
    "/:id",
    async (req, res) => {
      const { id } = req.params;
      const deleted = await UserModel.findByIdAndDelete(id);
      if (!deleted)
        throw new NotFoundError(`User with ID '${id}' not found`);
      return res.send(deleted);
    }
  )
}