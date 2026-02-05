// TODO - maybe later think about some support of dynamic values for constants below
// maybe some way to specify your own additional payment methods, accounts or categories

export const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const PAYMENT_METHODS = new Set([
  "atm",
  "card",
  "cash",
  "blik",
  "credit",
  "payment",
  "bankTransfer",
  "cashDepositMachine",
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
  "cash",
  "pekao",
  "mBank",
  "revolut",
  "veloBank",
  "nestBank",
  "aliorBank",
  "cardByCliq",
  "creditAgricole",
])

export const CATEGORIES = new Set([
  "atm",
  "food",
  "work",
  "sport",
  "other",
  "refund",
  "health",
  "allegro",
  "exchange",
  "donation",
  "clothing",
  "myAccount",
  "education",
  "transport",
  "furniture",
  "utilities",
  "investments",
  "electronics",
  "entertainment",
  "accommodation",  
  "cashDepositMachine",
])

export const TRANSACTION_TYPES = new Set([
  "expense",
  "income",
])