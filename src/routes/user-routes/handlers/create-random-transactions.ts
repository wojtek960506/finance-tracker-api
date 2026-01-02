import { TransactionCreateDTO } from "@schemas/transaction";
import { TransactionModel } from "@models/transaction-model";
import {
  ACCOUNTS,
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES
} from "@utils/consts";

type RandomStandardTransaction = TransactionCreateDTO & { ownerId: string; sourceIndex: number };
type RandomTransferTransaction = { sourceRefIndex: number; }
type RandomTransferTransactionPair = [RandomTransferTransaction, RandomTransferTransaction];
type RandomExchangeTransaction = RandomTransferTransaction & {
  currencies: string;
  exchangeRate: number;
};
type RandomExchangeTransactionPair = [RandomExchangeTransaction, RandomExchangeTransaction];


const randomDate = (from: Date, to: Date): Date => {
  const fromTime = from.getTime();
  const toTime = to.getTime();

  const randomTime = fromTime + Math.random() * (toTime - fromTime);
  return new Date(randomTime);
}

const randomNumber = (from: number, to: number) => {
  return from + Math.random() * (to - from);
}

function randomFromSet<T>(set: Set<T>): T {
  const values = Array.from(set);
  const index = Math.floor(Math.random() * values.length);
  return values[index];
}

function weightedRandomFromSet<T extends string | number>(
  set: Set<T>,
  weights: Record<T, number>
): T {
  const weightsMap = new Map([...set].map(value => [value, weights[value]]));
  const totalWeight = [...weightsMap.values()].reduce((a, b) => a + b, 0);

  let random = Math.random() * totalWeight;

  for (const [value, weight] of weightsMap) {
    random -= weight;
    if (random <= 0) return value;
  }

  throw new Error("invalid weights");
}

function excludeFromSet<T>(set: Set<T>, toExclude: T[]): Set<T> {
  return new Set([...set].filter(value => !toExclude.includes(value)))
}

const prepareRandomStandardTransaction = (
  ownerId: string, date: Date, category: string, index: number,
): RandomStandardTransaction => {
  const amount = randomNumber(10, 10000);
  const currency = randomFromSet(CURRENCIES);
  const account = randomFromSet(ACCOUNTS);
  const transactionType = weightedRandomFromSet(
    TRANSACTION_TYPES,
    { "expense": 5, "income": 1 }
  )
  const paymentMethod = randomFromSet(PAYMENT_METHODS);
  const description = `${transactionType} - ${category} - ${amount} ${currency} ` +
    `- ${date.toISOString().slice(0,10)}`;
  
  return {
    date,
    description,
    amount,
    currency,
    category,
    transactionType,
    paymentMethod,
    account,
    sourceIndex: index,
    ownerId
  }
}

// const prepareRandomExchangeTransacitons = (
//   ownerId: string, date: Date, category: string, index: number,
// ): RandomExchangeTransactionPair => {

// }

const prepareRandomTransferTransactions = (
  ownerId: string, date: Date, index: number,
): RandomTransferTransactionPair => {
  const amount = randomNumber(10, 10000);
  const currency = randomFromSet(CURRENCIES);
  const accountFrom = randomFromSet(ACCOUNTS);
  const accountTo = randomFromSet(ACCOUNTS);
  const category = "myAccount";

  // TODO - when some rules for corelation between payment method and account will be added
  // then this have to be updated
  const paymentMethod = randomFromSet(new Set(["bankTransfer", "cash", "card"]));
  const description = `Money Transfer: ${accountFrom} --> ${accountTo}`;

  const commonProps = {
    amount,
    currency,
    category,
    paymentMethod,
    description,
    ownerId,
    date,
  }
  const from = {
    ...commonProps,
    transactionType: "expense",
    account: accountFrom,
    sourceIndex: index,
    sourceRefIndex: index + 1,
  }
  const to = {
    ...commonProps,
    transactionType: "income",
    account: accountTo,
    sourceIndex: index + 1,
    sourceRefIndex: index,
  }
  return [from, to];
}

export async function createRandomTransactions(
  ownerId: string,
  totalTransactions: number,
): Promise<number> {

  const startDate = new Date("2015-01-01");
  const endDate = new Date("2025-12-31");

  // date: string,
  // description: string,
  // amount: number,
  // currency: string,
  // category: string,
  // transactionType: "income" | "expense",
  // paymentMethod: string,
  // account: string,
  // createdAt: Date,
  // updatedAt: Date,
  // exchangeRate?: number,
  // currencies?: string,
  // sourceIndex: number,
  // sourceRefIndex?: number,
  // ownerId: Types.ObjectId,
  // refId: Types.ObjectId,

  const randomTransactions = [];
  for (let i = 0; i < totalTransactions;) {
    const date = randomDate(startDate, endDate);
    const category = randomFromSet(CATEGORIES);

    if (category === "myAccount") {
      const [from, to] = prepareRandomTransferTransactions(ownerId, date, i);
      randomTransactions.push(from, to);
      i += 2;
      continue;
    } else if (category === "exchange") {
      // randomTransactions.push(prepareRandomExchangeTransacitons(ownerId, date, category, i));
      // i += 2;
      continue;
    } else {
      randomTransactions.push(prepareRandomStandardTransaction(ownerId, date, category, i));
      i += 1;
    }
  }


  const result = await TransactionModel.insertMany(randomTransactions, { rawResult: true });

  // TODO add refId in transactions which have sourceRefIndex

  return result.insertedCount;
}