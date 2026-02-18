import jwt from "jsonwebtoken";
import { getEnv } from "@/config";
import { randomBytes, createHash } from "crypto";


// create JWT access token
export function createAccessToken(payload: object) {
  const { jwtAccessSecret } = getEnv();
  return jwt.sign(payload, jwtAccessSecret, { expiresIn: "30m" });
}

// create secure random refresh token (opaque) and return both token and its hashed form
export function createRefreshToken() {
  const token = randomBytes(64).toString("hex");
  const tokenHash = getTokenHash(token);
  return { token, tokenHash }
}

export function getTokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// verify access token (throws if invalid)
export function verifyAccessToken(token: string) {
  const { jwtAccessSecret } = getEnv();
  return jwt.verify(token, jwtAccessSecret);
}
