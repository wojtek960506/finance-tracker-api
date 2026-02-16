import { describe, expect, it } from "vitest";
import { serializeUser } from "@schemas/serializers";
import { getUserResultJSON, getUserResultSerialized } from "@/test-utils/factories/user";


describe("serializeUser", () => {
  
  const user = getUserResultJSON();
  const iUser = {
    ...user,
    toObject: () => ({ ...user, __v: 0 })
  }
  const userSerialized = getUserResultSerialized();

  it("serialize user", () => {
    expect(serializeUser(iUser as any)).toEqual(userSerialized);
  });
});
