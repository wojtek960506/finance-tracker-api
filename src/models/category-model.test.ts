import { Types } from "mongoose";
import { CategoryModel } from "@models/category-model";
import { describe, expect, it } from "vitest";


describe("CategoryModel ownerId validator", () => {
  it("accepts user category with ownerId", () => {
    const doc = new CategoryModel({
      type: "user",
      ownerId: new Types.ObjectId(),
      name: "Food",
      nameNormalized: "food",
    });

    const error = doc.validateSync();

    expect(error).toBeUndefined();
  });

  it("rejects user category when ownerId is null", () => {
    const doc = new CategoryModel({
      type: "user",
      ownerId: null,
      name: "Food",
      nameNormalized: "food",
    });

    const error = doc.validateSync();

    expect(error?.errors.ownerId).toBeDefined();
    expect(error?.errors.ownerId?.message).toContain("Invalid ownerId");
  });

  it("rejects user category without ownerId", () => {
    const doc = new CategoryModel({
      type: "user",
      name: "Food",
      nameNormalized: "food",
    });

    const error = doc.validateSync();

    expect(error?.errors.ownerId).toBeDefined();
    expect(error?.errors.ownerId?.message).toContain("Invalid ownerId");
  });

  it("accepts system category without ownerId", () => {
    const doc = new CategoryModel({
      type: "system",
      name: "Transfer",
      nameNormalized: "transfer",
    });

    const error = doc.validateSync();

    expect(error).toBeUndefined();
  });

  it("rejects system category with ownerId", () => {
    const doc = new CategoryModel({
      type: "system",
      ownerId: new Types.ObjectId(),
      name: "Transfer",
      nameNormalized: "transfer",
    });

    const error = doc.validateSync();

    expect(error?.errors.ownerId).toBeDefined();
    expect(error?.errors.ownerId?.message).toContain("Invalid ownerId");
  });
});
