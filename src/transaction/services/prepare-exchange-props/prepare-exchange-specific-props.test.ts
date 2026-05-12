import { describe, expect, it } from 'vitest';

import { TransactionExchangeDTO } from '@transaction/schema';

import { prepareExchangeSpecificProps } from './prepare-exchange-specific-props';

describe('prepareExchangeSpecificProps', () => {
  it("expense's amount is higher than income's amount", () => {
    const props: Pick<
      TransactionExchangeDTO,
      'amountExpense' | 'amountIncome' | 'currencyExpense' | 'currencyIncome' | 'description'
    > = {
      amountExpense: 10,
      amountIncome: 42.1,
      currencyExpense: 'EUR',
      currencyIncome: 'PLN',
      description: 'EUR to PLN',
    };

    const { currencies, description, exchangeRate } = prepareExchangeSpecificProps(props);

    expect(currencies).toBe('EUR/PLN');
    expect(description).toBe('EUR to PLN');
    expect(exchangeRate).toBe(4.21);
  });

  it("expense's amount is smaller than income's amount", () => {
    const props: Pick<
      TransactionExchangeDTO,
      'amountExpense' | 'amountIncome' | 'currencyExpense' | 'currencyIncome' | 'description'
    > = {
      amountExpense: 42.1,
      amountIncome: 10,
      currencyExpense: 'PLN',
      currencyIncome: 'EUR',
      description: 'PLN to EUR',
    };

    const { currencies, description, exchangeRate } = prepareExchangeSpecificProps(props);

    expect(currencies).toBe('EUR/PLN');
    expect(description).toBe('PLN to EUR');
    expect(exchangeRate).toBe(4.21);
  });
});
