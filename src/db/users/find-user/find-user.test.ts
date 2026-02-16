import { UserModel } from "@models/user-model";
import { findUser } from "@db/users/find-user/find-user";
import { afterEach, describe, expect, it, vi } from "vitest";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { UserNotFoundError } from "@utils/errors/user-errors";
import { getUserResultJSON } from "@/test-utils/factories/user";


describe("findUser", () => {

  const user = getUserResultJSON();

  afterEach(() => { vi.clearAllMocks() });

  it("user exists", async () => {
    vi.spyOn(UserModel, "findById").mockResolvedValue(user);

    const result = await findUser(USER_ID_STR);

    expect(UserModel.findById).toHaveBeenCalledOnce();
    expect(UserModel.findById).toHaveBeenCalledWith(USER_ID_STR);
    expect(result).toEqual(user);
  });

  it("user does not exist", async () => {
    vi.spyOn(UserModel, "findById").mockResolvedValue(undefined);

    await expect(findUser(USER_ID_STR)).rejects.toThrow(UserNotFoundError);

    expect(UserModel.findById).toHaveBeenCalledOnce();
    expect(UserModel.findById).toHaveBeenCalledWith(USER_ID_STR);
  });
});
