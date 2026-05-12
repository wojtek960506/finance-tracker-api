import { describe, expect, it } from 'vitest';

import { TransactionExchangeDTO } from '@transaction/schema';

import { prepareExchangeSpecificProps } from './prepare-exchange-specific-props';

describe('prepareExchangeSpecificProps', () => {
  it("expense's amount is higher than income's amount", () => {
    const props: Pick<
      TransactionExchangeDTO,
      'amountExpense' | 'amountIncome' | 'currencyExpense' | 'currencyIncome'
    > = {
      amountExpense: 10,
      amountIncome: 42.1,
      currencyExpense: 'EUR',
      currencyIncome: 'PLN',
    };

    const { currencies, exchangeRate } = prepareExchangeSpecificProps(props);

    expect(currencies).toBe('EUR/PLN');
    expect(exchangeRate).toBe(4.21);
  });

  it("expense's amount is smaller than income's amount", () => {
    const props: Pick<
      TransactionExchangeDTO,
      'amountExpense' | 'amountIncome' | 'currencyExpense' | 'currencyIncome'
    > = {
      amountExpense: 42.1,
      amountIncome: 10,
      currencyExpense: 'PLN',
      currencyIncome: 'EUR',
    };

    const { currencies, exchangeRate } = prepareExchangeSpecificProps(props);

    expect(currencies).toBe('EUR/PLN');
    expect(exchangeRate).toBe(4.21);
  });
});
