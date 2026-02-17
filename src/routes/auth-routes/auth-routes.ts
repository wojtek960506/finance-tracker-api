import jwt from "jsonwebtoken";
import { FastifyInstance } from "fastify";
import { NotFoundError } from "@utils/errors";
import { UserModel } from "@models/user-model";
import { UserResponseDTO } from "@schemas/user";
import { validateBody } from "@utils/validation";
import { serializeUser } from "@schemas/serializers";
import { LoginDTO, LoginSchema } from "@schemas/auth";
import { authorizeAccessToken } from "@services/auth";
import { loginHandler, refreshHandler } from "./handlers";
import { AuthenticatedRequest } from "@routes/routes-types";


type AccessTokenResponse = { accessToken: string };

const isProductionEnv = process.env.NODE_ENV === "production";
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProductionEnv,
  sameSite: isProductionEnv ? "none" : "lax",
  path: "/",
} as const;

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginDTO, Reply: AccessTokenResponse }>(
    "/login", 
    { preHandler: validateBody(LoginSchema) },
    loginHandler,
  )

  app.get<{ Reply: AccessTokenResponse }>("/refresh", refreshHandler);

  app.post(
    "/logout",
    async (req, res) => {
      // 1. first clear refresh token
      // There is no refresh mechanism for logout. In case of present access token we remove
      // hash of refresh token for the given user from DB.
      res.clearCookie("refreshToken", { ...refreshCookieOptions, maxAge: 0 });

      // 2. check if access token is correct
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.code(204).send();
      const token = authHeader.split(" ")[1];
      try {
        jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
      } catch {
        return res.code(204).send();
      }

      // 3. check if user can be found by access token
      const payload = app.jwt.verify(token);
      const userId = (payload as { userId: string }).userId;
      const user = await UserModel.findOne({ _id: userId });
      if (!user) return res.code(204).send();

      // 4. clear refresh token hash in DB
      user.refreshTokenHash = undefined; 
      await user.save();
      return res.code(204).send();
    }
  )

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
