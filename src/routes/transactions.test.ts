import { Transaction } from "@models/Transaction";
import Fastify from "fastify";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { transactionRoutes } from "./transactions";
import { generateFullTransaction } from "@utils/__mocks__/transactionMock";
import { registerErrorHandler } from "@/plugins/errorHandler";

vi.mock("@models/Transaction", () => ({
  Transaction: {
    findByIdAndUpdate: vi.fn(),
    create: vi.fn(),
    findById: vi.fn()
  },
}));

describe("Transaction Routes (Fastify integration)", async () => {
  const app = Fastify();
  app.register(transactionRoutes);
  await registerErrorHandler(app);

  const id = "123";

  beforeEach(() => { vi.clearAllMocks(); })

  it("should return single transaction via GET when found", async () => {
    const transaction = { _id: id, ...generateFullTransaction() };
    (Transaction.findById as Mock).mockResolvedValue(transaction);

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
    (Transaction.findById as Mock).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "GET",
      url: `/${id}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ message: expect.any(String) });
  })

  it("should create transaction via POST", async () => {
    const body = generateFullTransaction();
    const newTransaction = { _id: id, ...body };
    (Transaction.create as Mock).mockResolvedValue(newTransaction);

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