import { FastifyRequest } from "fastify";
import { ValidationError } from "./errors";
import { validateBody } from "./validation";
import { describe, expect, it } from "vitest";
import { TransactionStandardSchema } from "@schemas/transaction";
import { generateFullStandardTransaction } from "../test-utils/mocks/transactionMock";


describe("validateBody", () => {

  it("when data is proper then no errors", async () => {
    const fullBody = generateFullStandardTransaction();
    const req = { body: { ...fullBody } };

    const validateFunc = validateBody(TransactionStandardSchema);
    
    await validateFunc(req as FastifyRequest, {} as any);
    expect(req.body).toEqual(fullBody);
  })

  it("when data is not proper then there are errors", async () => {
    const { date, ...partialBody } = generateFullStandardTransaction()
    const req = { body: { ...partialBody } };

    const validateFunc = validateBody(TransactionStandardSchema);
    
    try {
      await validateFunc(req as FastifyRequest, {} as any);
      throw new Error("Expected `validateFunc` to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).statusCode).toBe(422);
      expect((error as ValidationError).details).not.toBeUndefined();
    }
  })

})