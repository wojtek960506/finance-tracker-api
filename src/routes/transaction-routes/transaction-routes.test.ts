import Fastify from "fastify";
import * as serviceT from "@services/transactions";
import { randomObjectIdString } from "@utils/random";
import { streamTransactions } from "@db/transactions";
import { registerErrorHandler } from "@plugins/errorHandler";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { getCsvForTransactions } from "@/test-utils/get-csv-for-transactions";
import { transactionRoutes } from "@routes/transaction-routes/transaction-routes";
import {
  getTransactionExchangeDTO,
  getTransactionStandardDTO,
  getStandardTransactionResultJSON,
  getTransactionTransferDTO,
} from "@/test-utils/mocks/transactions";


async function* mockAsyncCursor<T>(items: T[]) { for (const item of items) { yield item; } }

const USER_ID = randomObjectIdString();
const MOCKED_RESULT = { result: "result" };

const mockPreHandler = vi.fn(async (req, _res) => { (req as any).userId = USER_ID });

vi.mock("@services/auth", () => ({ authorizeAccessToken: vi.fn(() => mockPreHandler) }));
vi.mock("@db/transactions", () => ({ streamTransactions: vi.fn() }));
vi.mock("@models/transaction-model", () => ({ TransactionModel: { deleteMany: vi.fn() } }));

describe("transaction routes", async () => {

  const app = Fastify();
  app.register(transactionRoutes);
  await registerErrorHandler(app);

  const [T_ID, T_SRC_IDX] = [randomObjectIdString(), 1];
  const standardT = getStandardTransactionResultJSON(USER_ID, T_SRC_IDX, T_ID);
  const standardDTO = getTransactionStandardDTO();
  const exchangeDTO = getTransactionExchangeDTO();
  const transferDTO = getTransactionTransferDTO();
  
  afterEach(() => { vi.clearAllMocks() });

  it("should get transactions - 'GET /'", async () => {
    vi.spyOn(serviceT, "getTransactions").mockResolvedValue(MOCKED_RESULT as any);
    const response = await app.inject({ method: "GET", url: "/" });
    expect(serviceT.getTransactions).toHaveBeenCalledOnce();
    expect(serviceT.getTransactions).toHaveBeenCalledWith(
      { page: 1, limit: 20, sortBy: "date", sortOrder: "desc" },
      USER_ID
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it("should export transactions - 'GET /export'", async () => {
    (streamTransactions as Mock).mockReturnValue(
      mockAsyncCursor([{ ...standardT, date: new Date(standardT.date) }])
    );
    const response = await app.inject({ method: "GET", url: "/export" });
    expect(streamTransactions).toHaveBeenCalledOnce();
    expect(streamTransactions).toHaveBeenCalledWith(USER_ID);
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.headers["content-disposition"]).toContain("transactions-backup");
    expect(response.payload).toEqual(getCsvForTransactions(
      { ...standardT, date: standardT.date.slice(0, 10) }
    ));
  });

   it.each<[
    "totals" | "statistics",
    "totals" | "statistics",
    "getTransactionTotals" | "getTransactionStatistics"
  ]>([
    ["totals", "totals", "getTransactionTotals"],
    ["statistics", "statistics", "getTransactionStatistics"],
  ])("should get %s of transaction - 'GET /%s'", async (kind, _, serviceName) => {
    vi.spyOn(serviceT, serviceName).mockResolvedValue(MOCKED_RESULT as any);
    const query = { transactionType: "expense", currency: "PLN" };
    const response = await app.inject({ method: "GET", url: `/${kind}`, query });
    expect(serviceT[serviceName]).toHaveBeenCalledOnce();
    expect(serviceT[serviceName]).toHaveBeenCalledWith(query, USER_ID);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it("should get transaction - `GET /:id`", async () => {
    vi.spyOn(serviceT, "getTransaction").mockResolvedValue(MOCKED_RESULT as any);
    const response = await app.inject({ method: "GET", url: `/${T_ID}` });
    expect(serviceT.getTransaction).toHaveBeenCalledOnce();
    expect(serviceT.getTransaction).toHaveBeenCalledWith(T_ID, USER_ID);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it.each<[
    "standard" | "exchange" | "transfer",
    "standard" | "exchange" | "transfer",
    "createStandardTransaction" | "createExchangeTransaction" | "createTransferTransaction",
    any
  ]>([
    ["standard", "standard", "createStandardTransaction", standardDTO],
    ["exchange", "exchange", "createExchangeTransaction", exchangeDTO],
    ["transfer", "transfer", "createTransferTransaction", transferDTO],
  ])("should create %s transaction - 'POST /%s'", async (kind, _, serviceName, body) => {
      vi.spyOn(serviceT, serviceName).mockResolvedValue(MOCKED_RESULT as any);
      const response = await app.inject({ method: "POST", url: `/${kind}`, body });
      expect(serviceT[serviceName]).toHaveBeenCalledOnce();
      expect(serviceT[serviceName]).toHaveBeenCalledWith(body, USER_ID);
      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(MOCKED_RESULT);
    }
  );

  it.each<[
    "standard" | "exchange" | "transfer",
    "standard" | "exchange" | "transfer",
    "updateStandardTransaction" | "updateExchangeTransaction" | "updateTransferTransaction",
    any
  ]>([
    ["standard", "standard", "updateStandardTransaction", standardDTO],
    ["exchange", "exchange", "updateExchangeTransaction", exchangeDTO],
    ["transfer", "transfer", "updateTransferTransaction", transferDTO],
  ])("should update %s transaction - 'PUT /%s'", async (kind, _, serviceName, body) => {
      vi.spyOn(serviceT, serviceName).mockResolvedValue(MOCKED_RESULT as any);
      const response = await app.inject({ method: "PUT", url: `/${kind}/${T_ID}`, body });
      expect(serviceT[serviceName]).toHaveBeenCalledOnce();
      expect(serviceT[serviceName]).toHaveBeenCalledWith(T_ID, USER_ID, body);
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(MOCKED_RESULT);
    }
  );

  it("should delete transaction - 'DELETE /:id'", async () => {
    vi.spyOn(serviceT, "deleteTransaction").mockResolvedValue(MOCKED_RESULT as any);
    const response = await app.inject({ method: "DELETE", url: `/${T_ID}`});
    expect(serviceT.deleteTransaction).toHaveBeenCalledOnce();
    expect(serviceT.deleteTransaction).toHaveBeenCalledWith(T_ID, USER_ID);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it("should delete all transactions - 'DELETE /'", async () => {
    (TransactionModel.deleteMany as Mock).mockResolvedValue(MOCKED_RESULT);
    const response = await app.inject({ method: "DELETE", url: "/" });
    expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  })
})
