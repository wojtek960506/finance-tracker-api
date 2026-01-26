import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "crypto";


const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
// const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
// const REFRESH_EXPIRES_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "30", 10);

// create JWT access token
export function createAccessToken(payload: object) {
  // return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES! });
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "30m" });
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
  return jwt.verify(token, ACCESS_SECRET);
}