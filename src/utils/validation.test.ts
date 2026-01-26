import { ValidationError } from "./errors";
import { describe, expect, it } from "vitest";
import { validateBody, validateQuery } from "./validation";
import { TransactionStandardSchema } from "@schemas/transaction";
import { TransactionStatisticsQuerySchema } from "@schemas/transaction-query";
import { generateFullStandardTransaction } from "../test-utils/mocks/transactionMock";


describe("validation", () => {
  const validBody = generateFullStandardTransaction();
  const validQuery = { transactionType: "expense", currency: "PLN" };
  const { date, ...notValidBody}  = generateFullStandardTransaction();
  const notValidQuery = { transactionType: "expense" };

  it.each([
    ["validateBody", validateBody, "body", validBody, TransactionStandardSchema],
    ["validateQuery", validateQuery, "query", validQuery, TransactionStatisticsQuerySchema]
  ])("%s - when data is proper then no errors", async (
    _funcName, func, reqKey, reqValue, schema
  ) => {
    const req = { [reqKey as "body" | "query"]: reqValue };
    const validateFunc = func(schema);

    await validateFunc(req as any, {} as any);

    expect(req[reqKey]).toEqual(reqValue);
  })

  it.each([
    ["validateBody", validateBody, "body", notValidBody, TransactionStandardSchema],
    ["validateQuery", validateQuery, "query", notValidQuery, TransactionStatisticsQuerySchema]
  ])("%s - when data is not proper then error is thrown", async (
    _funcName, func, reqKey, reqValue, schema
  ) => {
    const req = { [reqKey]: reqValue };
    const validateFunc = func(schema);

    try {
      await validateFunc(req as any, {} as any);
      throw new Error("Expected `validateFunc` to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).statusCode).toBe(422);
      expect((error as ValidationError).details).not.toBeUndefined();
    }
  })
})