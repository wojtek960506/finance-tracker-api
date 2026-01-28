import { TransactionExchangeDTO } from "@schemas/transaction";


type PropsType = Pick<
  TransactionExchangeDTO,
  "amountExpense" |
  "amountIncome" |
  "currencyExpense" |
  "currencyIncome" |
  "additionalDescription"
>

export const prepareExchangeSpecificProps = (
  props: PropsType,
) => {
  const {
    amountExpense,
    amountIncome,
    currencyExpense,
    currencyIncome,
    additionalDescription,
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
  
  let description = `${currencyExpense} -> ${currencyIncome}`;
  if (additionalDescription) description += ` (${additionalDescription})`;

  return { currencies, description, exchangeRate }
}