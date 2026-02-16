import { deleteUser } from "./delete-user";
import { UserModel } from "@models/user-model";
import { withSession } from "@utils/with-session";
import * as serializers from "@schemas/serializers";
import { randomObjectIdString } from "@utils/random";
import { CategoryModel } from "@models/category-model";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, vi } from "vitest";
import { USER_ID_STR } from "@/test-utils/factories/general";
import {
  UserNotFoundError,
  UserNotDeletedError,
  UserNotAuthorizedToDeleteError,
} from "@utils/errors/user-errors";
import {
  getUserResultJSON,
  getUserResultSerialized,
} from "@/test-utils/factories/user";


const sessionMock = {} as any;

vi.mock("@utils/with-session", () => ({
  withSession: vi.fn().mockImplementation(
    async (func, ...args) => await func(sessionMock, ...args)
  ),
}));

describe("deleteUser", () => {
  const user = getUserResultJSON();
  const userSerialized = getUserResultSerialized();
  const anotherUserId = randomObjectIdString();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deletes authenticated user", async () => {
    vi.spyOn(UserModel, "findById")
      .mockResolvedValueOnce(user as any)
      .mockResolvedValueOnce(user as any);
    vi.spyOn(TransactionModel, "deleteMany").mockResolvedValue({ deletedCount: 3 } as any);
    vi.spyOn(CategoryModel, "deleteMany").mockResolvedValue({ deletedCount: 2 } as any);
    vi.spyOn(UserModel, "deleteOne").mockResolvedValue({ deletedCount: 1 } as any);
    vi.spyOn(serializers, "serializeUser").mockReturnValue(userSerialized as any);

    const result = await deleteUser(USER_ID_STR, USER_ID_STR);

    expect(UserModel.findById).toHaveBeenCalledTimes(2);
    expect(UserModel.findById).toHaveBeenNthCalledWith(1, USER_ID_STR);
    expect(UserModel.findById).toHaveBeenNthCalledWith(2, USER_ID_STR);
    expect(withSession).toHaveBeenCalledOnce();
    expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
    expect(TransactionModel.deleteMany).toHaveBeenCalledWith(
      { ownerId: USER_ID_STR },
      { session: sessionMock },
    );
    expect(CategoryModel.deleteMany).toHaveBeenCalledOnce();
    expect(CategoryModel.deleteMany).toHaveBeenCalledWith(
      { ownerId: USER_ID_STR },
      { session: sessionMock },
    );
    expect(UserModel.deleteOne).toHaveBeenCalledOnce();
    expect(UserModel.deleteOne).toHaveBeenCalledWith(
      { _id: USER_ID_STR },
      { session: sessionMock },
    );
    expect(serializers.serializeUser).toHaveBeenCalledOnce();
    expect(serializers.serializeUser).toHaveBeenCalledWith(user);
    expect(result).toEqual(userSerialized);
  });

  it("throws when authenticated user does not exist", async () => {
    vi.spyOn(UserModel, "findById").mockResolvedValue(null);

    await expect(deleteUser(USER_ID_STR, USER_ID_STR)).rejects.toThrow(UserNotFoundError);

    expect(withSession).not.toHaveBeenCalled();
  });

  it("throws when user is not authorized to delete another user", async () => {
    vi.spyOn(UserModel, "findById").mockResolvedValue(user as any);

    await expect(deleteUser(anotherUserId, USER_ID_STR)).rejects.toThrow(UserNotAuthorizedToDeleteError);

    expect(withSession).not.toHaveBeenCalled();
  });

  it("allows special test user to delete another user", async () => {
    const specialUser = { ...user, email: "test1@test.com" };

    vi.spyOn(UserModel, "findById")
      .mockResolvedValueOnce(specialUser as any)
      .mockResolvedValueOnce(user as any);
    vi.spyOn(TransactionModel, "deleteMany").mockResolvedValue({ deletedCount: 10 } as any);
    vi.spyOn(CategoryModel, "deleteMany").mockResolvedValue({ deletedCount: 4 } as any);
    vi.spyOn(UserModel, "deleteOne").mockResolvedValue({ deletedCount: 1 } as any);
    vi.spyOn(serializers, "serializeUser").mockReturnValue(userSerialized as any);

    const result = await deleteUser(anotherUserId, USER_ID_STR);

    expect(withSession).toHaveBeenCalledOnce();
    expect(UserModel.findById).toHaveBeenNthCalledWith(1, USER_ID_STR);
    expect(UserModel.findById).toHaveBeenNthCalledWith(2, anotherUserId);
    expect(result).toEqual(userSerialized);
  });

  it("throws when user to delete does not exist", async () => {
    vi.spyOn(UserModel, "findById")
      .mockResolvedValueOnce(user as any)
      .mockResolvedValueOnce(null);
    vi.spyOn(TransactionModel, "deleteMany");
    vi.spyOn(CategoryModel, "deleteMany");
    vi.spyOn(UserModel, "deleteOne");
    vi.spyOn(serializers, "serializeUser");

    await expect(deleteUser(USER_ID_STR, USER_ID_STR)).rejects.toThrow(UserNotFoundError);

    expect(TransactionModel.deleteMany).not.toHaveBeenCalled();
    expect(CategoryModel.deleteMany).not.toHaveBeenCalled();
    expect(UserModel.deleteOne).not.toHaveBeenCalled();
    expect(serializers.serializeUser).not.toHaveBeenCalled();
  });

  it("throws when user was not deleted", async () => {
    vi.spyOn(UserModel, "findById")
      .mockResolvedValueOnce(user as any)
      .mockResolvedValueOnce(user as any);
    vi.spyOn(TransactionModel, "deleteMany").mockResolvedValue({ deletedCount: 10 } as any);
    vi.spyOn(CategoryModel, "deleteMany").mockResolvedValue({ deletedCount: 4 } as any);
    vi.spyOn(UserModel, "deleteOne").mockResolvedValue({ deletedCount: 0 } as any);
    vi.spyOn(serializers, "serializeUser");

    await expect(deleteUser(USER_ID_STR, USER_ID_STR)).rejects.toThrow(UserNotDeletedError);

    expect(serializers.serializeUser).not.toHaveBeenCalled();
  });
});
