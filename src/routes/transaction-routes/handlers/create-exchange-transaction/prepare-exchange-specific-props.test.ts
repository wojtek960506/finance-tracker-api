import { describe, expect, it } from "vitest";
import { prepareExchangeSpecificProps } from "./prepare-exchange-specific-props";

describe("prepareExchangeSpecificProps", () => {
  it("expense's amount is higher than income's amount", () => {
    const props = {
      amountExpense: 10,
      amountIncome: 42.1,
      currencyExpense: "EUR",
      currencyIncome: "PLN",
    }

    const { currencies, description, exchangeRate } = prepareExchangeSpecificProps(props);
    
    expect(currencies).toBe("EUR/PLN");
    expect(description).toBe("EUR -> PLN");
    expect(exchangeRate).toBe(4.21);
  })

  it("expense's amount is smaller than income's amount", () => {
    const props = {
      amountExpense: 42.1,
      amountIncome: 10,
      currencyExpense: "PLN",
      currencyIncome: "EUR",
      additionalDescription: "some desc"
    }

    const { currencies, description, exchangeRate } = prepareExchangeSpecificProps(props);
    
    expect(currencies).toBe("EUR/PLN");
    expect(description).toBe("PLN -> EUR (some desc)");
    expect(exchangeRate).toBe(4.21);
  })
})