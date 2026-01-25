import { faker } from "@faker-js/faker";
import { excludeFromSet } from "@utils/set";
import { TransactionStandardDTO } from "@schemas/transaction";
import { 
  ACCOUNTS,
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES
} from "@utils/consts";


// Generate a complete transaction (for full update or create)
export const generateFullStandardTransaction = (): TransactionStandardDTO => ({
  date: faker.date.past(),
  description: faker.commerce.productDescription(),
  amount: faker.number.float({ min: 10, max: 500, multipleOf: 0.01 }),
  currency: faker.helpers.arrayElement([...CURRENCIES]),
  category: faker.helpers.arrayElement([...excludeFromSet(CATEGORIES, ["myAccount", "exchange"])]),
  transactionType: faker.helpers.arrayElement([...TRANSACTION_TYPES]),
  paymentMethod: faker.helpers.arrayElement([...PAYMENT_METHODS]),
  account: faker.helpers.arrayElement([...ACCOUNTS]),
});
