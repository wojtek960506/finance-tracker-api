import Fastify from "fastify";
import { randomObjectIdString } from "@utils/random";
import { transactionRoutes } from "./transaction-routes";
import { TransactionModel } from "@models/transaction-model";
import { registerErrorHandler } from "@/plugins/errorHandler";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { generateFullStandardTransaction } from "@utils/__mocks__/transactionMock";
import { getNextSourceIndex, createExchangeTransaction } from "@services/transactions";
import {
  getExchangeTransactionProps,
  getTransactionCreateExchangeDTO
} from "@utils/__mocks__/transactions/create-exchange";


const USER_ID = randomObjectIdString();
const TRANSACTION_ID = '234';

const mockPreHandler = vi.fn(async (req, _reply) => {
  (req as any).userId = USER_ID;
})

vi.mock("@services/auth/authorize-access-token", () => ({
  authorizeAccessToken: vi.fn(() => mockPreHandler),
}));

vi.mock("@services/transactions/get-next-source-index", () => ({
  getNextSourceIndex: vi.fn(),
}));

vi.mock("@services/transactions/create-exchange-transaction", () => ({
  createExchangeTransaction: vi.fn(),
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
    const transaction = { id, ...generateFullStandardTransaction() };
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

  it("should create standard transaction via POST", async () => {
    const body = generateFullStandardTransaction();
    const sourceIndex = 1;
    const newTransaction = {
      ...body,
      id,
      ownerId: USER_ID,
      sourceIndex,
    };
    (TransactionModel.create as Mock).mockResolvedValue(newTransaction);
    (serializeTransaction as Mock).mockReturnValue(newTransaction);
    (getNextSourceIndex as Mock).mockResolvedValue(sourceIndex);

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

  it ("should create exchange transaction(s) via POST", async () => {
    const sourceIndexExpense = 1;
    const sourceIndexIncome = 2;
    const idExpense = randomObjectIdString();
    const idIncome = randomObjectIdString();
    const dto = getTransactionCreateExchangeDTO();
    const { incomeProps, expenseProps } = getExchangeTransactionProps(
      USER_ID, sourceIndexExpense, sourceIndexIncome
    );
    const expenseTransaction = { 
      ...expenseProps,
      id: idExpense,
      refId: idIncome,
      date: expenseProps.date.toISOString(),
    };
    const incomeTransaction = {
      ...incomeProps,
      id: idIncome,
      refId: idExpense,
      date: expenseProps.date.toISOString(),
    };

    (createExchangeTransaction as Mock).mockResolvedValue(
      [expenseTransaction, incomeTransaction]
    );
    (getNextSourceIndex as Mock)
      .mockResolvedValueOnce(sourceIndexExpense)
      .mockResolvedValueOnce(sourceIndexIncome);
    
    const response = await app.inject({
      method: "POST",
      url: `/exchange`,
      payload: dto
    });

    expect(createExchangeTransaction).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledTimes(2);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(1, USER_ID);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(2, USER_ID);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual([expenseTransaction, incomeTransaction]);
  })
})