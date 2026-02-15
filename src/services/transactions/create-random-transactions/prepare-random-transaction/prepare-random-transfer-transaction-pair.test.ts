import { randomFromSet, randomNumber } from "@utils/random";
import { Mock, afterEach, describe, expect, it, vi } from "vitest";
import {
  TEST_DATE,
  TEST_OWNER_ID,
  TEST_SOURCE_INDEX,
  TEST_CATEGORY_ID,
} from "../test-fixtures";
import {
  prepareRandomTransferTransactionPair,
} from "./prepare-random-transfer-transaction-pair";


vi.mock("@utils/random", () => ({
  randomFromSet: vi.fn(),
  randomNumber: vi.fn(),
}));

describe("prepareRandomTransferTransactionPair", () => {
  afterEach(() => { vi.clearAllMocks() });

  it("builds an expense and income transfer pair with linked source refs", () => {
    (randomNumber as Mock).mockReturnValue(250);
    (randomFromSet as Mock)
      .mockReturnValueOnce("EUR")
      .mockReturnValueOnce("wallet")
      .mockReturnValueOnce("bank")
      .mockReturnValueOnce("bankTransfer");

    const [expense, income] = prepareRandomTransferTransactionPair(
      TEST_OWNER_ID,
      TEST_DATE,
      TEST_SOURCE_INDEX,
      TEST_CATEGORY_ID,
    );

    expect(randomNumber).toHaveBeenCalledOnce();
    expect(randomNumber).toHaveBeenCalledWith(10, 10000);
    expect(randomFromSet).toHaveBeenCalledTimes(4);
    expect(expense).toEqual({
      date: TEST_DATE,
      amount: 250,
      ownerId: TEST_OWNER_ID,
      currency: "EUR",
      categoryId: TEST_CATEGORY_ID,
      paymentMethod: "bankTransfer",
      account: "wallet",
      sourceIndex: TEST_SOURCE_INDEX,
      sourceRefIndex: TEST_SOURCE_INDEX + 1,
      transactionType: "expense",
      description: "Money Transfer: wallet --> bank",
    });
    expect(income).toEqual({
      date: TEST_DATE,
      amount: 250,
      ownerId: TEST_OWNER_ID,
      currency: "EUR",
      categoryId: TEST_CATEGORY_ID,
      paymentMethod: "bankTransfer",
      account: "bank",
      sourceRefIndex: TEST_SOURCE_INDEX,
      sourceIndex: TEST_SOURCE_INDEX + 1,
      transactionType: "income",
      description: "Money Transfer: wallet --> bank",
    });
  });
});
