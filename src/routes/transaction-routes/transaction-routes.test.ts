import Fastify from "fastify";
import { randomObjectIdString } from "@utils/random";
import { transactionRoutes } from "./transaction-routes";
import { TransactionModel } from "@models/transaction-model";
import { registerErrorHandler } from "@/plugins/errorHandler";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { generateFullStandardTransaction } from "@/test-utils/mocks/transactionMock";
import {
  createExchangeTransaction,
  createStandardTransaction,
  createTransferTransaction,
} from "@services/transactions";
import {
  getTransactionCreateExchangeDTO,
  getTransactionCreateStandardDTO,
  getTransactionCreateTransferDTO,
  getExchangeTransactionResultJSON,
  getStandardTransactionResultJSON,
  getTransferTransactionResultJSON,
} from "@/test-utils/mocks/transactions";


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

vi.mock("@services/transactions/create-transaction", () => ({
  createStandardTransaction: vi.fn(),
  createExchangeTransaction: vi.fn(),
  createTransferTransaction: vi.fn(),
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

    const response = await app.inject({ method: "GET", url: `/${id}` });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ...transaction,
      date: transaction.date.toISOString(),
    });
  })

  it("should return code 404 via GET when transaction not found", async () => {
    (TransactionModel.findById as Mock).mockResolvedValue(undefined);

    const response = await app.inject({ method: "GET", url: `/${id}` });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ message: expect.any(String) });
  })

  it("should create standard transaction via POST", async () => {
    const [TRANSACTION_SOURCE_INDEX, TRANSACTION_ID] = [1, randomObjectIdString()];
    const dto = getTransactionCreateStandardDTO();
    const resultJSON = getStandardTransactionResultJSON(
      USER_ID, TRANSACTION_SOURCE_INDEX, TRANSACTION_ID
    );
    (createStandardTransaction as Mock).mockResolvedValue(resultJSON);
    
    const response = await app.inject({ method: "POST", url: `/standard`, payload: dto });

    expect(createStandardTransaction).toHaveBeenCalledOnce();
    expect(createStandardTransaction).toHaveBeenCalledWith(dto, USER_ID);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(resultJSON);
  });

  it.each([
    [
      "transfer", 
      getTransactionCreateTransferDTO,
      getTransferTransactionResultJSON,
      createTransferTransaction,
    ], [
      "exchange",
      getTransactionCreateExchangeDTO,
      getExchangeTransactionResultJSON,
      createExchangeTransaction,
    ]
  ])("should create %s transaction pair via POST", async (
    url, getDTO, getResultJSON, createFunc,
  ) => {
    const [EXPENSE_SOURCE_INDEX, INCOME_SOURCE_INDEX] = [1, 2];
    const [EXPENSE_ID, INCOME_ID] = [randomObjectIdString(), randomObjectIdString()];
    const dto = getDTO();
    const resultJSON = getResultJSON(
      USER_ID, EXPENSE_SOURCE_INDEX, INCOME_SOURCE_INDEX, EXPENSE_ID, INCOME_ID
    );
    (createFunc as Mock).mockResolvedValue(resultJSON);

    const response = await app.inject({ method: "POST", url: `/${url}`, payload: dto });

    expect(createFunc).toHaveBeenCalledOnce();
    expect(createFunc).toHaveBeenCalledWith(dto, USER_ID);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(resultJSON);
  })
})