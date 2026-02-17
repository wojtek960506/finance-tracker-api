import { FastifyInstance } from "fastify";
import { NotFoundError } from "@utils/errors";
import { UserModel } from "@models/user-model";
import { UserResponseDTO } from "@schemas/user";
import { validateBody } from "@utils/validation";
import { serializeUser } from "@schemas/serializers";
import { LoginDTO, LoginSchema } from "@schemas/auth";
import { authorizeAccessToken } from "@services/auth";
import { AuthenticatedRequest } from "@routes/routes-types";
import { loginHandler, logoutHandler, refreshHandler } from "./handlers";


type AccessTokenResponse = { accessToken: string };

export async function authRoutes(app: FastifyInstance) {
  
  app.post<{ Body: LoginDTO, Reply: AccessTokenResponse }>(
    "/login", 
    { preHandler: validateBody(LoginSchema) },
    loginHandler,
  )

  app.get<{ Reply: AccessTokenResponse }>("/refresh", refreshHandler);

  app.post("/logout", logoutHandler);

  app.get<{ Reply: UserResponseDTO }>(
    '/me',
    { preHandler: authorizeAccessToken() },
    async (req, res) => {
      const userId = (req as AuthenticatedRequest).userId;
      const user = await UserModel.findById(userId);
      if (!user)
        throw new NotFoundError(`User with ID '${userId}' not found`);   
      return res.send(serializeUser(user));
    }
  )
}
