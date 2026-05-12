import { TransactionExchangeDTO } from '@transaction/schema';

type PropsType = Pick<
  TransactionExchangeDTO,
  'amountExpense' | 'amountIncome' | 'currencyExpense' | 'currencyIncome' | 'description'
>;

export const prepareExchangeSpecificProps = (props: PropsType) => {
  const {
    amountExpense,
    amountIncome,
    currencyExpense,
    currencyIncome,
    description,
  } = props;

  let currencies;
  let exchangeRate;
  if (amountExpense > amountIncome) {
    exchangeRate = amountExpense / amountIncome;
    currencies = `${currencyIncome}/${currencyExpense}`;
  } else {
    exchangeRate = amountIncome / amountExpense;
    currencies = `${currencyExpense}/${currencyIncome}`;
  }

  return { currencies, description, exchangeRate };
};
