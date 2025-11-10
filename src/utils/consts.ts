// TODO - maybe later think about some support of dynamic values for constants below
// maybe some way to specify your own additional payment methods, accounts or categories

export const PAYMENT_METHODS = new Set([
  "atm",
  "bankTransfer",
  "cash",
  "blik",
  "payment",
  "credit",
  "cashDepositMachine",
  "card",
])

export const CURRENCIES = new Set([
  "PLN",
  "EUR",
  "CZK",
  "GBP",
  "USD",
  "HUF",
  "RON",
])

export const ACCOUNTS = new Set([
  "pekao",
  "veloBank",
  "nestBank",
  "aliorBank",
  "revolut",
  "mBank",
  "cardByCliq",
  "alior",
  "cash",
])

export const CATEGORIES = new Set([
  "food",
  "investments",
  "exchange",
  "myAccount",
  "transport",
  "refund",
  "clothing",
  "cashDepositMachine",
  "accommodation",
  "donation",
  "furniture",
  "entertainment",
  "health",
  "work",
  "sport",
  "other",
  "education",
  "electronics",
  "atm",
  "allegro",
  "utilities",
])

export const TRANSACTION_TYPES = new Set([
  "expense",
  "income",
])