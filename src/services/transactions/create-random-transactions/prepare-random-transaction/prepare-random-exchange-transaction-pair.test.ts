import { randomFromSet, randomNumber } from "@utils/random";
import { Mock, afterEach, describe, expect, it, vi } from "vitest";
import {
  TEST_DATE,
  TEST_OWNER_ID,
  TEST_CATEGORY_ID,
  TEST_SOURCE_INDEX,
} from "../test-fixtures";
import {
  prepareRandomExchangeTransactionPair,
} from "./prepare-random-exchange-transaction-pair";


vi.mock("@utils/random", () => ({
  randomFromSet: vi.fn(),
  randomNumber: vi.fn(),
}));

describe("prepareRandomExchangeTransactionPair", () => {
  afterEach(() => { vi.clearAllMocks() });

  it("builds an exchange pair when expense amount is greater than income amount", () => {
    (randomNumber as Mock)
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(20);
    (randomFromSet as Mock)
      .mockReturnValueOnce("PLN")
      .mockReturnValueOnce("USD")
      .mockReturnValueOnce("bank")
      .mockReturnValueOnce("cash");

    const [expense, income] = prepareRandomExchangeTransactionPair(
      TEST_OWNER_ID,
      TEST_DATE,
      TEST_SOURCE_INDEX,
      TEST_CATEGORY_ID,
    );

    expect(randomNumber).toHaveBeenCalledTimes(2);
    expect(randomNumber).toHaveBeenNthCalledWith(1, 10, 10000);
    expect(randomNumber).toHaveBeenNthCalledWith(2, 10, 10000);
    expect(randomFromSet).toHaveBeenCalledTimes(4);
    expect(expense).toEqual({
      date: TEST_DATE,
      amount: 100,
      account: "bank",
      ownerId: TEST_OWNER_ID,
      currency: "PLN",
      categoryId: TEST_CATEGORY_ID,
      paymentMethod: "cash",
      sourceIndex: TEST_SOURCE_INDEX,
      sourceRefIndex: TEST_SOURCE_INDEX + 1,
      transactionType: "expense",
      exchangeRate: 5,
      currencies: "USD/PLN",
      description: "PLN -> USD",
    });
    expect(income).toEqual({
      date: TEST_DATE,
      amount: 20,
      account: "bank",
      ownerId: TEST_OWNER_ID,
      currency: "USD",
      categoryId: TEST_CATEGORY_ID,
      paymentMethod: "cash",
      sourceRefIndex: TEST_SOURCE_INDEX,
      sourceIndex: TEST_SOURCE_INDEX + 1,
      transactionType: "income",
      exchangeRate: 5,
      currencies: "USD/PLN",
      description: "PLN -> USD",
    });
  });

  it("builds an exchange pair when expense amount is lower than income amount", () => {
    (randomNumber as Mock)
      .mockReturnValueOnce(20)
      .mockReturnValueOnce(100);
    (randomFromSet as Mock)
      .mockReturnValueOnce("EUR")
      .mockReturnValueOnce("GBP")
      .mockReturnValueOnce("wallet")
      .mockReturnValueOnce("bankTransfer");

    const [expense, income] = prepareRandomExchangeTransactionPair(
      TEST_OWNER_ID,
      TEST_DATE,
      TEST_SOURCE_INDEX,
      TEST_CATEGORY_ID,
    );

    expect(expense.exchangeRate).toBe(0.2);
    expect(income.exchangeRate).toBe(0.2);
    expect(expense.currencies).toBe("GBP/EUR");
    expect(income.currencies).toBe("GBP/EUR");
    expect(expense.description).toBe("EUR -> GBP");
    expect(income.description).toBe("EUR -> GBP");
  });
});
