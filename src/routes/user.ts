import { UserCreateDTO, UserCreateSchema, UserResponseDTO, UsersResponseDTO } from "@schemas/user";
import { FastifyInstance } from "fastify";
import { AuthenticatedRequest, DeleteManyReply, ParamsJustId } from "./types";
import { UserModel } from "@models/user-model";
import { AppError, NotFoundError } from "@utils/errors";
import { validateBody } from "@utils/validation";
import argon2 from "argon2";
import { serializeUser } from "@schemas/serialize-user";
import { authorizeAccessToken } from "@/services/authorization";


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
      const { password, ...rest } = req.body;
      const passwordHash1 = await argon2.hash(password);
      
      try {
        const newUser = await UserModel.create({
          ...rest,
          passwordHash: passwordHash1,
        });
        res.code(201).send(serializeUser(newUser));
      } catch (err) {
        if ((err as { code: number }).code === 11000)
          throw new AppError(409, "User with given email already exists");
        else
          throw new AppError(400, (err as { message: string }).message);
      }
    }
  )

  app.delete<{ Params: ParamsJustId, Reply: UserResponseDTO }>(
    "/:id",
    async (req, res) => {
      const { id } = req.params;
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