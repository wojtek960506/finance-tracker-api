import jwt from "jsonwebtoken";
import { getEnv } from "@/config";
import { UserModel } from "@models/user-model";


export const logout = async (authHeader: string | undefined): Promise<void> => {
  let payload;
  
  // check if access token is correct
  if (!authHeader?.startsWith("Bearer ")) return;
  const token = authHeader.split(" ")[1];
  try {
    const { jwtAccessSecret } = getEnv();
    payload = jwt.verify(token, jwtAccessSecret) as { userId: string};
  } catch { return }

  // check if user can be found by access token
  const user = await UserModel.findOne({ _id: payload.userId });
  if (!user) return;

  // clear refresh token hash in DB
  user.refreshTokenHash = undefined; 
  await user.save();
}
