import { describe, expect, it, vi } from "vitest";

// mock BEFORE importing the file that uses argon2
vi.mock("argon2", () => ({ default: { hash: vi.fn() }}));

import argon2 from "argon2";
import { createUser } from "./create-user";
import { UserModel } from "@models/user-model";
import * as serializers from "@schemas/serializers";
import {
  getUserDTO,
  getUserResultJSON,
  getUserResultSerialized,
  USER_PASSWORD_HASH,
} from "@/test-utils/factories/user";


describe("createUser", () => {

  const user = getUserResultJSON();
  const userSerialized = getUserResultSerialized();
  const { password, ...restOfUserDTO } = getUserDTO();
  const sessionMock = {} as any;

  it("creates user", async () => {
    // vi.spyOn(argon2, "hash").mockResolvedValue(USER_PASSWORD_HASH);
    (argon2.hash as any).mockResolvedValue(USER_PASSWORD_HASH);
    vi.spyOn(UserModel, "create").mockResolvedValue([user] as any);
    vi.spyOn(serializers, "serializeUser").mockReturnValue(userSerialized as any);

    const result = await createUser({ ...restOfUserDTO, password }, sessionMock);

    expect(argon2.hash).toHaveBeenCalledOnce();
    expect(argon2.hash).toHaveBeenCalledWith(password);
    expect(UserModel.create).toHaveBeenCalledOnce();
    expect(UserModel.create).toHaveBeenCalledWith(
      [{ ...restOfUserDTO, passwordHash: USER_PASSWORD_HASH }],
      { session: sessionMock },
    );
    expect(serializers.serializeUser).toHaveBeenCalledOnce();
    expect(serializers.serializeUser).toHaveBeenCalledWith(user);
    expect(result).toEqual(userSerialized);
  });


});
