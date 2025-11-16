import { UserCreateDTO, UserCreateSchema, UserResponseDTO, UsersResponseDTO } from "@schemas/user";
import { FastifyInstance } from "fastify";
import { ParamsJustId } from "./types";
import { User } from "@models/User";
import { NotFoundError } from "@utils/errors";
import { validateBody } from "@utils/validation";
import argon2 from "argon2";


export async function userRoutes(app: FastifyInstance) {
  
  app.get<{ Params: ParamsJustId, Reply: UsersResponseDTO }>(
    "/",
    async () => {
      return await User.find().sort({ lastName: 1 });
    }
  )

  app.get<{ Params: ParamsJustId, Reply: UserResponseDTO }>(
    "/:id",
    async (req, res) => {
      const { id } = req.params;
      const user = await User.findById(id);
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
      const newUser = await User.create({
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
      const deleted = await User.findByIdAndDelete(id);
      if (!deleted)
        throw new NotFoundError(`User with ID '${id}' not found`);
      return res.send(deleted);
    }
  )
}