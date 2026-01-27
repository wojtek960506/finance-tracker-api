export const TOTALS_BY_CURRENCY = [{
  _id: { currency: "PLN", transactionType: "income" },
  totalAmount: 1,
  totalItems: 1,
  averageAmount: 1,
  maxAmount: 1,
  minAmount: 1,
}, {
  _id: { currency: "PLN", transactionType: "expense" },
  totalAmount: 4,
  totalItems: 2,
  averageAmount: 2,
  maxAmount: 3,
  minAmount: 1,
}];

export const TOTALS_OVERALL = [
  { totalItems: 100, _id: { transactionType: "expense" } },
  { totalItems: 50, _id: { transactionType: "income" } }
];

export const PARSED_TOTALS_BY_CURRENCY = {
  PLN: {
    income: { totalAmount: 1, totalItems: 1, averageAmount: 1, maxAmount: 1, minAmount: 1 },
    expense: { totalAmount: 4, totalItems: 2, averageAmount: 2, maxAmount: 3, minAmount: 1 },
    totalItems: 3,
  }
};

export const PARSED_TOTALS_OVERALL = {
  expense: { totalItems: 100 },
  income: { totalItems: 50 },
  totalItems: 150,
};

