import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { FastifyInstance } from "fastify";
import { LoginSchema } from "@schemas/auth";
import { UserModel } from "@models/user-model";
import { UserResponseDTO } from "@schemas/user";
import { validateBody } from "@utils/validation";
import { serializeUser } from "@schemas/serializers";
import { AppError, NotFoundError } from "@utils/errors";
import { AuthenticatedRequest } from "@routes/routes-types";
import {
  getTokenHash,
  createAccessToken,
  createRefreshToken,
  authorizeAccessToken,
} from "@services/auth";


const isProductionEnv = process.env.NODE_ENV === "production";
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProductionEnv,
  sameSite: isProductionEnv ? "none" : "lax",
  path: "/",
} as const;

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/login", 
    { preHandler: validateBody(LoginSchema) },
    async (req, res) => {
      const { email, password } = req.body as { email: string, password: string };
      const user = await UserModel.findOne({ email }).exec();
      if (!user) 
        throw new AppError(401, `User with email '${email}' not found`);

      const valid = await argon2.verify(user.passwordHash, password);
      if (!valid)
        throw new AppError(401, `Invalid credentials`);

      // create access token (include minimal claims)
      const accessToken = createAccessToken({
        userId: user._id.toString(),
        email: user.email
      });

      // create refresh token and store hashed version
      const { token: refreshToken, tokenHash } = createRefreshToken();

      // append the refresh token hash to the user (rotate strategy)
      user.refreshTokenHash = { tokenHash, createdAt: new Date() };
      await user.save();

      // set refresh token cookie (HttpOnly, Secure)
      const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "30", 10);
      res.setCookie("refreshToken", refreshToken, {
        ...refreshCookieOptions,
        maxAge: 60 * 60 * 24 * refreshExpiresDays,
      })

      return res.send({ accessToken });
    }
  )

  app.get("/refresh", async (req, res) => {

    const refreshToken = req.cookies["refreshToken"];
    if (!refreshToken) {
      return res.code(401).send({ "message": "Missing refresh token" });
    }

    const refreshTokenHash = getTokenHash(refreshToken);

    // find user by refresh token hash
    const user = await UserModel.findOne({
      "refreshTokenHash.tokenHash": refreshTokenHash
    });
    
    if (!user) throw new AppError(401, `Invalid refresh token`);

    // Rotate refresh token (security best practice)
    const { token: newRefreshToken, tokenHash: newRefreshTokenHash } = createRefreshToken();

    // remove old hash, add new one
    user.refreshTokenHash = { tokenHash: newRefreshTokenHash, createdAt: new Date() };
    await user.save();

    // set new cookie
    const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "30", 10);
    const isProductionEnv = process.env.NODE_ENV === "production";
    res.setCookie("refreshToken", newRefreshToken, {
      ...refreshCookieOptions,
      maxAge: 60 * 60 * 24 * refreshExpiresDays,
    })

    // issue new access token
    const accessToken = createAccessToken({
      userId: user._id.toString(),
      email: user.email
    });

    return res.send({ accessToken });
  })

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
