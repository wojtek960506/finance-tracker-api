import Fastify from "fastify";
import * as serviceU from "@services/users";
import { userRoutes } from "./user-routes";
import { getUserDTO } from "@/test-utils/factories/user";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { registerErrorHandler } from "@plugins/errorHandler";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TEST_USER_USERNAME,
  TEST_USER_TOTAL_TRANSACTIONS,
} from "@/test-utils/factories/user";


const MOCKED_RESULT = { result: "result" };

const mockPreHandler = vi.fn(async (req, _res) => { (req as any).userId = USER_ID_STR });

vi.mock("@services/auth", () => ({ authorizeAccessToken: vi.fn(() => mockPreHandler) }));

describe("user routes", async () => {

  const app = Fastify();
  app.register(userRoutes);
  await registerErrorHandler(app);

  const userDTO = getUserDTO();

  afterEach(() => { vi.clearAllMocks() });

  it("should get users - 'GET /'", async () => {
    vi.spyOn(serviceU, "getUsers").mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({ method: "GET", url: "/" });

    expect(serviceU.getUsers).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it("should get user - 'GET /:id'", async () => {
    vi.spyOn(serviceU, "getUser").mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({ method: "GET", url: `/${USER_ID_STR}` });

    expect(serviceU.getUser).toHaveBeenCalledOnce();
    expect(serviceU.getUser).toHaveBeenCalledWith(USER_ID_STR, USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it("should create user - 'POST /'", async () => {
    vi.spyOn(serviceU, "createUser").mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({ method: "POST", url: "/", body: userDTO });

    expect(serviceU.createUser).toHaveBeenCalledOnce();
    expect(serviceU.createUser).toHaveBeenCalledWith(userDTO);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it("should create test user - 'POST /test'", async () => {
    const body = {
      username: TEST_USER_USERNAME,
      totalTransactions: TEST_USER_TOTAL_TRANSACTIONS,
    };
    vi.spyOn(serviceU, "createTestUser").mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({ method: "POST", url: "/test", body });

    expect(serviceU.createTestUser).toHaveBeenCalledOnce();
    expect(serviceU.createTestUser).toHaveBeenCalledWith(body);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it("should delete user - 'DELETE /:id'", async () => {
    vi.spyOn(serviceU, "deleteUser").mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({ method: "DELETE", url: `/${USER_ID_STR}` });

    expect(serviceU.deleteUser).toHaveBeenCalledOnce();
    expect(serviceU.deleteUser).toHaveBeenCalledWith(USER_ID_STR, USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });
});
