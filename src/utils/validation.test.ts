import { FastifyRequest } from "fastify";
import { ValidationError } from "./errors";
import { validateBody } from "./validation";
import { describe, expect, it } from "vitest";
import { TransactionCreateStandardSchema } from "@schemas/transaction";
import {
  generatePartialTransaction,
  generateFullStandardTransaction,
} from "../test-utils/mocks/transactionMock";


describe("validateBody", () => {

  it("when data is proper then no errors", async () => {
    const fullBody = generateFullStandardTransaction();
    const req = { body: { ...fullBody } };

    const validateFunc = validateBody(TransactionCreateStandardSchema);
    
    await validateFunc(req as FastifyRequest, {} as any);
    expect(req.body).toEqual(fullBody);
  })

  it("when data is proper then no errors", async () => {
    const partialBody = generatePartialTransaction()
    const req = { body: { ...partialBody } };

    const validateFunc = validateBody(TransactionCreateStandardSchema);
    
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