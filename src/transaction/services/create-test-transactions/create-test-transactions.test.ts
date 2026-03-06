import { AppError } from "@utils/errors"
import { TransactionModel } from "@transaction/model"
import { USER_ID_STR } from "@/test-utils/factories/general"
import { createRandomTransactions } from "@transaction/services"
import { it, vi, Mock, expect, describe, afterEach } from "vitest"
import { createTestTransactions } from "./create-test-transactions"


const sessionMock = {} as any;

vi.mock("@utils/with-session", () => ({
  withSession: vi.fn().mockImplementation(
    async (func, ...args) => {
      return await func(sessionMock, ...args);
    },
  ),
}));
vi.mock("@transaction/services", () => ({ createRandomTransactions: vi.fn() }));
vi.mock("@transaction/model", () => ({
  TransactionModel: { countDocuments: vi.fn() },
}));

describe("createTestTransactions", () => {
  const TOTAL_TRANSACTIONS = 1000;
  const DEFAULT_TRANSACTIONS = 200;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates test transactions with provided totalTransactions", async () => {
    (TransactionModel.countDocuments as Mock).mockResolvedValue(0);
    (createRandomTransactions as Mock).mockResolvedValue(TOTAL_TRANSACTIONS);

    const result = await createTestTransactions(USER_ID_STR, TOTAL_TRANSACTIONS);

    expect(TransactionModel.countDocuments).toHaveBeenCalledOnce();
    expect(TransactionModel.countDocuments).toHaveBeenCalledWith({ ownerId: USER_ID_STR });
    expect(createRandomTransactions).toHaveBeenCalledOnce();
    expect(createRandomTransactions).toHaveBeenCalledWith(
      USER_ID_STR,
      TOTAL_TRANSACTIONS,
      sessionMock,
    );
    expect(result).toEqual({ insertedCount: TOTAL_TRANSACTIONS });
  });

  it("uses default totalTransactions when value is not provided", async () => {
    (TransactionModel.countDocuments as Mock).mockResolvedValue(0);
    (createRandomTransactions as Mock).mockResolvedValue(DEFAULT_TRANSACTIONS);

    const result = await createTestTransactions(USER_ID_STR);

    expect(TransactionModel.countDocuments).toHaveBeenCalledOnce();
    expect(TransactionModel.countDocuments).toHaveBeenCalledWith({ ownerId: USER_ID_STR });
    expect(createRandomTransactions).toHaveBeenCalledOnce();
    expect(createRandomTransactions).toHaveBeenCalledWith(
      USER_ID_STR,
      DEFAULT_TRANSACTIONS,
      sessionMock,
    );
    expect(result).toEqual({ insertedCount: DEFAULT_TRANSACTIONS });
  });

  it("throws when owner already has transactions", async () => {
    (TransactionModel.countDocuments as Mock).mockResolvedValue(1);

    const resultPromise = createTestTransactions(USER_ID_STR, TOTAL_TRANSACTIONS);
    await expect(resultPromise).rejects.toThrow(AppError);
    await expect(resultPromise).rejects.toThrow(
      "Cannot add test transactions to a user which already owns some transactions",
    );

    expect(createRandomTransactions).not.toHaveBeenCalled();
  });
});
