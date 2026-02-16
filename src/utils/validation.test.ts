import { ValidationError } from "./errors";
import { describe, expect, it } from "vitest";
import { validateBody, validateQuery } from "./validation";
import { TransactionStandardSchema } from "@schemas/transaction";
import { getStandardTransactionDTO } from "@/test-utils/factories/transaction";
import {
  TransactionFiltersQuerySchema,
  TransactionStatisticsQuerySchema,
} from "@schemas/transaction-query";


const expectValidationError = async (promise: Promise<unknown>) => {
  await expect(promise).rejects.toBeInstanceOf(ValidationError);
  await expect(promise).rejects.toMatchObject({
    statusCode: 422,
    details: expect.anything(),
  });
};

describe("validation", () => {
  const validBody = getStandardTransactionDTO();
  const validQuery = { transactionType: "expense", currency: "PLN" };
  const { date, ...notValidBody }  = validBody;
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

    expectValidationError(validateFunc(req as any, {} as any));
  });

  it("validate not correct `excludeCategoryIds` in TransactionFiltersQuerySchema", async () => {
    const req = { query: { excludeCategoryIds: "not-object-id-1,not-object-id-2" } };
    const validateFunc = validateQuery(TransactionFiltersQuerySchema);

    expectValidationError(validateFunc(req as any, {} as any));
  });
});
