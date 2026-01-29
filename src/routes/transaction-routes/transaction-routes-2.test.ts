import Fastify from "fastify";
import { registerErrorHandler } from "@plugins/errorHandler";
import { transactionRoutes } from "@routes/transaction-routes/transaction-routes";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { getStandardTransactionResultJSON } from "@/test-utils/mocks/transactions";
import { randomObjectIdString } from "@utils/random";
import { getTransactions } from "@services/transactions";
import { streamTransactions } from "@db/transactions";
import { getCsvForTransactions } from "@/test-utils/get-csv-for-transactions";



async function* mockAsyncCursor<T>(items: T[]) { for (const item of items) { yield item; } }

const USER_ID = randomObjectIdString();

const mockPreHandler = vi.fn(async (req, _res) => { (req as any).userId = USER_ID });

vi.mock("@services/auth", () => ({ authorizeAccessToken: vi.fn(() => mockPreHandler) }));

vi.mock("@services/transactions/get-transactions", () => ({  getTransactions: vi.fn() }));

vi.mock("@db/transactions", () => ({
  streamTransactions: vi.fn(),
}));

describe("transaction routes", async () => {

  const app = Fastify();
  app.register(transactionRoutes);
  await registerErrorHandler(app);

  const [E_ID, I_ID] = [randomObjectIdString(), randomObjectIdString()];
  const [E_SRC_IDX, I_SRC_IDX] = [1, 2];
  const standardT = getStandardTransactionResultJSON(USER_ID, E_SRC_IDX, E_ID);
  
  afterEach(() => { vi.clearAllMocks() });

  it("should get transactions - `GET /`", async () => {
    const expectedRes = { page: 1, limit: 1, total: 1, totalPages: 1, items: [standardT] };
    (getTransactions as Mock).mockResolvedValue(expectedRes);
    const response = await app.inject({ method: "GET", url: "/" });
    expect(getTransactions).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(expectedRes);
  });

  it("should export transactions - `GET /export`", async () => {
    (streamTransactions as Mock).mockReturnValue(
      mockAsyncCursor([{ ...standardT, date: new Date(standardT.date) }])
    );
    const response = await app.inject({ method: "GET", url: "/export" });
    expect(streamTransactions).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.headers["content-disposition"]).toContain("transactions-backup");
    expect(response.payload).toEqual(getCsvForTransactions(
      { ...standardT, date: standardT.date.slice(0, 10) }
    ));
  });

})
