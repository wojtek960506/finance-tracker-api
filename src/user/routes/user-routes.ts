import { FastifyInstance } from "fastify"
import { ParamsJustId } from "@shared/http"
import { validateBody } from "@utils/validation"
import { authorizeAccessToken } from "@auth/services"
import {
  getUserHandler,
  getUsersHandler,
  createUserHandler,
  deleteUserHandler,
  createTestUserHandler,
} from "./handlers"
import {
  UserCreateDTO,
  UserResponseDTO,
  UserCreateSchema,
  UsersResponseDTO,
  TestUserCreateDTO,
  TestUserCreateSchema,
  TestUserCreateResponseDTO,
} from "@user/schema"


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
