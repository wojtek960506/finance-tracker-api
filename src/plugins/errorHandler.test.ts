import { z } from "zod";
import { AppError } from "@utils/errors";
import { registerErrorHandler } from "./errorHandler";
import { Mock, afterEach, describe, expect, it, vi } from "vitest";


const createReplyMock = () => {
  const send = vi.fn();
  const status = vi.fn().mockReturnValue({ send });
  return { send, status };
};

const getRegisteredHandler = async () => {
  const setErrorHandler = vi.fn();
  const app = {
    setErrorHandler,
    log: { error: vi.fn() },
  } as any;

  await registerErrorHandler(app);
  const handler = (setErrorHandler as Mock).mock.calls[0][0];
  return { app, handler, setErrorHandler };
};

describe("registerErrorHandler", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("registers error handler in fastify app", async () => {
    const { setErrorHandler } = await getRegisteredHandler();
    expect(setErrorHandler).toHaveBeenCalledOnce();
    expect(setErrorHandler).toHaveBeenCalledWith(expect.any(Function));
  });

  it("returns app error status and payload for AppError", async () => {
    const [message, details] = ["Some conflict", { key: "value" }];
    const { handler, app } = await getRegisteredHandler();
    const res = createReplyMock();
    const error = new AppError(409, message, details);

    handler(error, {} as any, res as any);

    expect(app.log.error).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledOnce();
    expect(res.send).toHaveBeenCalledWith({ message, details });
  });

  it("returns validation payload for zod errors", async () => {
    const { handler, app } = await getRegisteredHandler();
    const res = createReplyMock();
    const schema = z.object({
      user: z.object({ email: z.email() }),
    });
    const parseResult = schema.safeParse({ user: { email: "wrong-email" } });
    if (parseResult.success) {
      throw new Error("Expected schema parsing to fail for test setup");
    }

    handler(parseResult.error, {} as any, res as any);

    expect(app.log.error).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledOnce();
    expect(res.send).toHaveBeenCalledWith({
      message: "Validation error",
      details: [{ path: "user.email", message: expect.any(String) }],
    });
  });

  it("logs and returns 500 for unknown errors", async () => {
    const { handler, app } = await getRegisteredHandler();
    const res = createReplyMock();
    const error = new Error("Unexpected");

    handler(error, {} as any, res as any);

    expect(app.log.error).toHaveBeenCalledOnce();
    expect(app.log.error).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledOnce();
    expect(res.send).toHaveBeenCalledWith({
      message: "Internal server error",
      details: error,
    });
  });
});
