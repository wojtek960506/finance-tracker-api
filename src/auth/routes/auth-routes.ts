import { FastifyInstance } from "fastify";
import { UserResponseDTO } from "@user/schema";
import { validateBody } from "@utils/validation";
import { LoginDTO, LoginSchema } from "@auth/schema";
import { authorizeAccessToken } from "@auth/services";
import {
  getMeHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
} from "./handlers";


type AccessTokenResponse = { accessToken: string };

export async function authRoutes(app: FastifyInstance) {
  
  app.post<{ Body: LoginDTO, Reply: AccessTokenResponse }>(
    "/login",
    { preHandler: validateBody(LoginSchema) },
    loginHandler,
  );

  app.get<{ Reply: AccessTokenResponse }>("/refresh", refreshHandler);

  app.post("/logout", logoutHandler);

  app.get<{ Reply: UserResponseDTO }>(
    '/me',
    { preHandler: authorizeAccessToken() },
    getMeHandler,
  );
}
