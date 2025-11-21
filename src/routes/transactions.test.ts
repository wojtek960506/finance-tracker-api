import { TransactionModel } from "@models/transaction-model";
import Fastify from "fastify";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { transactionRoutes } from "./transactions";
import { generateFullTransaction } from "@utils/__mocks__/transactionMock";
import { registerErrorHandler } from "@/plugins/errorHandler";
import { serializeTransaction } from "@schemas/serialize-transaction";

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

  const id = "123";

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
    const newTransaction = { id, ...body };
    (TransactionModel.create as Mock).mockResolvedValue(newTransaction);
    (serializeTransaction as Mock).mockReturnValue(newTransaction);

    const response = await app.inject({
      method: "POST",
      url: `/`,
      payload: body
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      ...newTransaction,
      date: newTransaction.date.toISOString(),
    });
  })

  
})