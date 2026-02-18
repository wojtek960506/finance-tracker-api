import { beforeEach, describe, expect, it, vi } from "vitest";


const { dotenvConfigMock, startMock } = vi.hoisted(() => ({
  dotenvConfigMock: vi.fn(),
  startMock: vi.fn(),
}));

vi.mock("dotenv", () => ({
  default: { config: dotenvConfigMock },
}));

vi.mock("./app", () => ({
  start: startMock,
}));

describe("server entrypoint", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("loads env and starts app on import", async () => {
    await import("./server");

    expect(dotenvConfigMock).toHaveBeenCalledOnce();
    expect(startMock).toHaveBeenCalledOnce();
  });
});
