import { afterEach, describe, expect, it, vi } from "vitest";
import { refresh } from "./refresh";
import { UserModel } from "@models/user-model";
import {
  UnauthorizedInvalidRefreshTokenError,
  UnauthorizedMissingRefreshTokenError,
} from "@utils/errors";
import {
  createAccessToken,
  createRefreshToken,
  getTokenHash,
} from "@services/auth/auth-tokens";


vi.mock("@services/auth/auth-tokens", () => ({
  createAccessToken: vi.fn(),
  createRefreshToken: vi.fn(),
  getTokenHash: vi.fn(),
}));

describe("refresh", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("throws when refresh token is undefined", async () => {
    await expect(refresh(undefined)).rejects.toBeInstanceOf(
      UnauthorizedMissingRefreshTokenError,
    );
    expect(getTokenHash).not.toHaveBeenCalled();
  });

  it("throws when user for refresh token hash is not found", async () => {
    (getTokenHash as any).mockReturnValue("refresh-token-hash");
    vi.spyOn(UserModel, "findOne").mockResolvedValue(null as any);

    await expect(refresh("refresh-token")).rejects.toBeInstanceOf(
      UnauthorizedInvalidRefreshTokenError,
    );
    expect(getTokenHash).toHaveBeenCalledOnce();
    expect(getTokenHash).toHaveBeenCalledWith("refresh-token");
    expect(UserModel.findOne).toHaveBeenCalledOnce();
    expect(UserModel.findOne).toHaveBeenCalledWith({
      "refreshTokenHash.tokenHash": "refresh-token-hash",
    });
    expect(createRefreshToken).not.toHaveBeenCalled();
    expect(createAccessToken).not.toHaveBeenCalled();
  });

  it("rotates refresh token, saves user and returns new tokens", async () => {
    const userSaveMock = vi.fn().mockResolvedValue(undefined);
    const user = {
      _id: { toString: () => "user-123" },
      email: "john@example.com",
      refreshTokenHash: null,
      save: userSaveMock,
    } as any;

    (getTokenHash as any).mockReturnValue("old-refresh-token-hash");
    vi.spyOn(UserModel, "findOne").mockResolvedValue(user);
    (createRefreshToken as any).mockReturnValue({
      token: "new-refresh-token",
      tokenHash: "new-refresh-token-hash",
    });
    (createAccessToken as any).mockReturnValue("new-access-token");

    const result = await refresh("old-refresh-token");

    expect(getTokenHash).toHaveBeenCalledWith("old-refresh-token");
    expect(UserModel.findOne).toHaveBeenCalledWith({
      "refreshTokenHash.tokenHash": "old-refresh-token-hash",
    });
    expect(createRefreshToken).toHaveBeenCalledOnce();
    expect(createAccessToken).toHaveBeenCalledOnce();
    expect(createAccessToken).toHaveBeenCalledWith({
      userId: "user-123",
      email: "john@example.com",
    });

    expect(user.refreshTokenHash.tokenHash).toBe("new-refresh-token-hash");
    expect(user.refreshTokenHash.createdAt).toBeInstanceOf(Date);
    expect(userSaveMock).toHaveBeenCalledOnce();

    expect(result).toEqual({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
  });
});
