import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import argon2 from "argon2";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
// const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
// const REFRESH_EXPIRES_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "30", 10);

// create JWT access token
export function createAccessToken(payload: object) {
  // return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES! });
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "1h" });
}

// create secure random refresh token (opaque) and return both token and its hashed form
export async function createRefreshToken() {
  // use a secure random string (UUID + crypto random can be used)
  const token = randomUUID() + "." + Date.now().toString(36);
  const tokenHash = await argon2.hash(token); // store hash in DB
  return { token, tokenHash } 
}

// verify access token (throws if invalid)
export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET);
}