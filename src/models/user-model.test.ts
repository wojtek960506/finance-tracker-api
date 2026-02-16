import { UserModel } from "@models/user-model";
import { afterEach, describe, expect, it, vi } from "vitest";


describe("UserModel refreshTokenHash.createdAt default", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("sets createdAt default when refreshTokenHash is provided without createdAt", () => {
    const fixedNow = new Date("2026-02-15T12:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);

    const user = new UserModel({
      firstName: "A",
      lastName: "B",
      email: "a.b@test.com",
      passwordHash: "hash",
      refreshTokenHash: { tokenHash: "token-hash" }, // no createdAt
    });

    expect(user.refreshTokenHash?.createdAt).toBeInstanceOf(Date);
    expect(user.refreshTokenHash?.createdAt.toISOString()).toBe(fixedNow.toISOString());
  });
});
