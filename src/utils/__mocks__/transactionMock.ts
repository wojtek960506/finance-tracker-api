import { faker } from "@faker-js/faker";
import { TransactionPatchDTO, TransactionUpdateDTO } from "@schemas/transaction";

// Generate a complete transaction (for full update or create)
export const generateFullTransaction = (): TransactionUpdateDTO => ({
  date: faker.date.past(),
  description: faker.commerce.productDescription(),
  amount: faker.number.float({ min: 10, max: 500, multipleOf: 0.01 }),
  currency: faker.finance.currencyCode(),
  category: faker.commerce.department(),
  transactionType: faker.helpers.arrayElement(["income", "expense"]),
  paymentMethod: faker.helpers.arrayElement(["cash", "card", "blik", "transfer", "atm"]),
  account: faker.finance.accountName(),
});

// Generate a partial transaction (for patch update)
export const generatePartialTransaction = (): TransactionPatchDTO => {
  // Pick a few random fields
  const patch: TransactionPatchDTO = {};
  if (faker.datatype.boolean())
    patch.amount = faker.number.float({ min: 10, max: 500, multipleOf: 0.01 });
  if (faker.datatype.boolean()) patch.description = faker.commerce.productDescription();
  if (faker.datatype.boolean()) patch.category = faker.commerce.department();
  return patch;
}