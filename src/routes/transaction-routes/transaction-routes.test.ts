import Fastify from "fastify";
import { transactionRoutes } from "./transaction-routes";
import { getNextSourceIndex } from "@services/transactions";
import { TransactionModel } from "@models/transaction-model";
import { registerErrorHandler } from "@/plugins/errorHandler";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { generateFullTransaction } from "@utils/__mocks__/transactionMock";


const USER_ID = '123';
const TRANSACTION_ID = '234';

const mockPreHandler = vi.fn(async (req, _reply) => {
  (req as any).userId = USER_ID;
})

vi.mock("@services/auth/authorize-access-token", () => ({
  authorizeAccessToken: vi.fn(() => mockPreHandler),
}));

vi.mock("@services/transactions/get-next-source-index", () => ({
  getNextSourceIndex: vi.fn().mockResolvedValue('1'),
}));

vi.mock("@models/transaction-model", () => ({
  TransactionModel: {
    findByIdAndUpdate: vi.fn(),
    create: vi.fn(),
    findById: vi.fn()
  },
}));

vi.mock("@schemas/serialize-transaction", () => ({
  serializeTransaction: vi.fn()
}));

describe("Transaction Routes (Fastify integration)", async () => {
  const app = Fastify();
  app.register(transactionRoutes);
  await registerErrorHandler(app);

  const id = TRANSACTION_ID;

  beforeEach(() => { vi.clearAllMocks(); })

  it("should return single transaction via GET when found", async () => {
    const transaction = { id, ...generateFullTransaction() };
    (TransactionModel.findById as Mock).mockResolvedValue(transaction);
    (serializeTransaction as Mock).mockResolvedValue(transaction);

    const response = await app.inject({
      method: "GET",
      url: `/${id}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ...transaction,
      date: transaction.date.toISOString(),
    });
  })

  it("should return code 404 via GET when transaction not found", async () => {
    (TransactionModel.findById as Mock).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "GET",
      url: `/${id}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ message: expect.any(String) });
  })

  it("should create transaction via POST", async () => {
    const body = generateFullTransaction();
    const newTransaction = {
      ...body,
      id,
      ownerId: USER_ID,
      sourceIndex: "1",
    };
    (TransactionModel.create as Mock).mockResolvedValue(newTransaction);
    (serializeTransaction as Mock).mockReturnValue(newTransaction);

    const response = await app.inject({
      method: "POST",
      url: `/`,
      payload: body
    });

    expect(mockPreHandler).toHaveBeenCalledTimes(1);
    expect(getNextSourceIndex).toHaveBeenCalledTimes(1);
    expect(getNextSourceIndex).toHaveBeenCalledWith(USER_ID);
    
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      ...newTransaction,
      date: newTransaction.date.toISOString(),
    });
  });
})