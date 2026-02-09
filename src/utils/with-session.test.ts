import { withSession } from "@utils/with-session";
import { startSession } from "mongoose";
import { afterEach, describe, expect, it, vi } from "vitest";


const withTransactionMock = vi.fn();
const endSessionMock = vi.fn();

vi.mock("mongoose", async () => {
  const actual = await vi.importActual("mongoose");

  return {
    ...actual,
    startSession: vi.fn(async () => ({
      withTransaction: withTransactionMock,
      endSession: endSessionMock,
    }))
  }
});

const testResult = "some result"
const funcMock = vi.fn().mockResolvedValue(testResult);

describe("withSession", () => {
  
  afterEach(() => { vi.clearAllMocks() });

  it("function is properly executed inside session", async () => {
    withTransactionMock.mockImplementation(async (fn) => { await fn() });
    const [arg1, arg2] = ["a", "b"];

    const result = await withSession(funcMock, arg1, arg2);

    expect(startSession).toHaveBeenCalledOnce();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(funcMock).toHaveBeenCalledOnce();
    expect(funcMock).toHaveBeenCalledWith(expect.anything(), arg1, arg2);
    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(result).toEqual(testResult);
  });

  it("session is ended even when the error occured within `withTransaction`", async () => {
    withTransactionMock.mockImplementation(async (_) => { throw new Error() });

    await expect(withSession(funcMock)).rejects.toThrow(Error);

    expect(startSession).toHaveBeenCalledOnce();
    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(funcMock).not.toHaveBeenCalled();
    expect(withTransactionMock).toHaveBeenCalledOnce();
  });
});
