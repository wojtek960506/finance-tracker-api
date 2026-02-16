import { FastifyInstance } from "fastify";
import { ParamsJustId } from "../routes-types";
import { validateBody } from "@utils/validation";
import { authorizeAccessToken } from "@services/auth";
import {
  getUserHandler,
  getUsersHandler,
  createUserHandler,
  deleteUserHandler,
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
  );

  app.post<{ Body: TestUserCreateDTO, Reply: TestUserCreateResponseDTO }>(
    "/test",
    { preHandler: [validateBody(TestUserCreateSchema), authorizeAccessToken()] },
    createTestUserHandler,
  );

  app.delete<{ Params: ParamsJustId, Reply: UserResponseDTO }>(
    "/:id",
    { preHandler: authorizeAccessToken() },
    deleteUserHandler,
  );
}
