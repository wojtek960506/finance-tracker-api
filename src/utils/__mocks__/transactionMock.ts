import { faker } from "@faker-js/faker";
import { TransactionPatchDTO, TransactionUpdateDTO } from "@schemas/transaction";
import { 
  ACCOUNTS,
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES
} from "@utils/consts";

// Generate a complete transaction (for full update or create)
export const generateFullTransaction = (): TransactionUpdateDTO => ({
  date: faker.date.past(),
  description: faker.commerce.productDescription(),
  amount: faker.number.float({ min: 10, max: 500, multipleOf: 0.01 }),
  currency: faker.helpers.arrayElement([...CURRENCIES]),
  category: faker.helpers.arrayElement([...CATEGORIES]),
  transactionType: faker.helpers.arrayElement([...TRANSACTION_TYPES]),
  paymentMethod: faker.helpers.arrayElement([...PAYMENT_METHODS]),
  account: faker.helpers.arrayElement([...ACCOUNTS]),
});

// Generate a partial transaction (for patch update)
export const generatePartialTransaction = (): TransactionPatchDTO => {
  // Pick a few random fields
  const patch: TransactionPatchDTO = {};
  if (faker.datatype.boolean())
    patch.amount = faker.number.float({ min: 10, max: 500, multipleOf: 0.01 });
  if (faker.datatype.boolean()) patch.description = faker.commerce.productDescription();
  if (faker.datatype.boolean()) 
    patch.category = faker.helpers.arrayElement([...CATEGORIES]);
  return patch;
}