import { IUser, UserModel } from "@models/User";
import { LoginSchema } from "@schemas/auth";
import { validateBody } from "@utils/validation";
import { FastifyInstance } from "fastify";
import argon2 from "argon2";
import { createAccessToken, createRefreshToken } from "@/services/authTokens";
import { AppError } from "@utils/errors";
import jwt from "jsonwebtoken";
import fastify from "fastify";

export default async function authRoutes(app: FastifyInstance) {
  app.post(
    "/login", 
    { preHandler: validateBody(LoginSchema) },
    async (req, res) => {
      const { email, password } = req.body as { email: string, password: string };
      const user = await UserModel.findOne({ email }).exec();
      if (!user) return res.status(401).send(
        { error: `User with email '${email}' not found`}
      );

      const valid = await argon2.verify(user.passwordHash, password);
      if (!valid) return res.status(401).send(
        { error: "Invalid credentials" }
      );

      // create access token (include minimal claims)
      const accessToken = createAccessToken({
        userId: user._id.toString(),
        email: user.email
      });

      // create refresh token and store hashed version
      const { token: refreshToken, tokenHash } = await createRefreshToken();

      // append the refresh token hash to the user (rotate strategy)
      user.refreshTokenHashes = user.refreshTokenHashes ?? [];
      user.refreshTokenHashes.push({ tokenHash, createdAt: new Date() });
      await user.save();

      // set refresh token cookie (HttpOnly, Secure)
      const refreshExpiresDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "30", 10);
      res.setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/refresh",
        maxAge: 60 * 60 * 24 * refreshExpiresDays,
      });

      return res.send({ accessToken });
    }
  )

  app.get("/refresh", async (req, res) => {
    const refreshToken = req.cookies["refresh-token"];
    if (!refreshToken) {
      return res.code(401).send({ "message": "Missing refresh token" });
    }

    // find user who has some refresh tokens
    const candidates = await UserModel.find({
      refreshTokenHashes: { $exists: true, $ne: [] }
    });
    let user: IUser | null = null;
    let matchingHash: string | null = null;
    for (const candidate of candidates) {
      for (const { tokenHash } of candidate.refreshTokenHashes ?? []) {
        if (await argon2.verify(tokenHash, refreshToken)) {
          user = candidate;
          matchingHash = tokenHash;
          break;
        }
      }
      if (user) break;
    }
    
    if (!user) {
      return res.code(401).send({ message: "Invalid refresh token" });
    }

    // Rotate refresh token (security best practice)
    const { token: newRefreshToken, tokenHash: newTokenHash } = await createRefreshToken();
    
    // remove old hash, add new one
    user.refreshTokenHashes = (user.refreshTokenHashes ?? []).filter(h => h.tokenHash !== matchingHash!);
    user.refreshTokenHashes.push({ tokenHash: newTokenHash, createdAt: new Date() });
    await user.save();

    // set new cookie
    res.setCookie("refresh-token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      path: "api/auth/"
    })

    // issue new access token
    const accessToken = createAccessToken({ userId: user._id });
    return res.send({ accessToken });
  })

  app.post(
    "/logout",
    async (req, res) => {
      // get authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        throw new AppError(401, "Missing token");
      }

      const token = authHeader.split(" ")[1];
      try {
        jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
      } catch {
        throw new AppError(401, "Invalid or expired token");
      }

      const payload = app.jwt.verify(token);
      const userId = (payload as { userId: string }).userId;
      console.log('payload', payload)


      return res.send({ userId });
    }
  )
}