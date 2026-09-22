# 🗺️ Roadmap & Specification: Net Worth & Currency Normalization

This document outlines the architectural plan and execution steps for currency normalization across investments and the unified **Net Worth (`GET /api/net-worth`)** endpoint.

---

## 1. Overview of Architecture

The system tracks wealth across two fundamental pillars:
1. **Liquid Cash (Bank Accounts & Transactions)**: Account balances computed via transactions (`Income - Expenses`).
2. **Investment Portfolio (Investments)**: Asset valuations computed via latest snapshots and fallback cost bases (`Bought - Sold`).

To provide a single dashboard overview, the system will provide:
- **Phase 1**: Currency normalization on `GET /api/investments/summary?baseCurrency=...`
- **Phase 2**: Master wealth endpoint `GET /api/net-worth?baseCurrency=...`

---

## 2. Phase 1: Investment Summary Normalization (`GET /api/investments/summary`)

### Objective
Enhance the existing `/api/investments/summary` endpoint to accept an optional `?baseCurrency=` query parameter (e.g. `PLN`, `USD`, `EUR`) and utilize exchange rates (`getCrossRate`) to normalize values across currencies.

### Features
1. **Raw Currency Totals**: Keeps exact per-currency totals in `totalsByCurrency` to avoid rounding/precision loss.
2. **Normalized Currency Totals**: Adds `normalizedTotalCurrentValue`, `normalizedTotalNetInvested`, `normalizedTotalPnL` to each currency entry when `baseCurrency` is provided.
3. **Grand Total**: Adds `grandTotalNormalized` aggregating all currencies into the chosen base currency.

### Response Contract Extension
```typescript
export interface InvestmentSummaryResponseDTO {
  baseCurrency?: CurrencyCode;
  grandTotalNormalized?: {
    currentValue: number;
    netInvested: number;
    pnl: number;
    roiPercentage: number;
  };
  totalsByCurrency: Record<string, InvestmentCurrencySummaryDTO>;
  instruments: InvestmentInstrumentSummaryDTO[];
}
```

---

## 3. Phase 2: Master Net Worth Endpoint (`GET /api/net-worth`)

### Objective
Create a unified top-level endpoint that combines **Liquid Cash (Bank Accounts)** and **Investments (Portfolio)** to compute total net worth, asset allocation, and currency-specific breakdowns.

### Endpoint Definition
- **Method**: `GET`
- **Route**: `/api/net-worth`
- **Auth**: Required (Bearer JWT)
- **Query Params**: `?baseCurrency=PLN` (optional, defaults to user's primary currency or raw totals)

---

### Core Formulas

- **Total Net Worth** = Liquid Cash (Bank Accounts) + Total Investments Value
- **Net Worth (per currency)** = Cash Balance (Currency) + Investment Value (Currency)
- **Asset Allocation (%)** = `(Asset Class Value / Total Net Worth) * 100`

---

### TypeScript Response Contract

```typescript
export interface NetWorthResponseDTO {
  baseCurrency?: string;
  netWorth: {
    total: number;
    liquidCash: number;      // Total money in checking/savings bank accounts
    investments: number;     // Total valuation of all investment instruments
  };
  byCurrency: Record<string, {
    currency: string;
    cash: number;
    investments: number;
    total: number;
    normalizedTotal?: number; // Converted to baseCurrency
  }>;
  allocation: Record<string, {
    category: 'cash' | 'share' | 'fund' | 'termDeposit' | 'savings';
    amount: number;
    percentage: number;
  }>;
}
```

---

### Example JSON Response (`GET /api/net-worth?baseCurrency=PLN`)

```json
{
  "baseCurrency": "PLN",
  "netWorth": {
    "total": 150000.00,
    "liquidCash": 55000.00,
    "investments": 95000.00
  },
  "byCurrency": {
    "PLN": {
      "currency": "PLN",
      "cash": 35000.00,
      "investments": 55000.00,
      "total": 90000.00,
      "normalizedTotal": 90000.00
    },
    "USD": {
      "currency": "USD",
      "cash": 5000.00,
      "investments": 10000.00,
      "total": 15000.00,
      "normalizedTotal": 60000.00
    }
  },
  "allocation": {
    "cash": {
      "category": "cash",
      "amount": 55000.00,
      "percentage": 36.67
    },
    "share": {
      "category": "share",
      "amount": 40000.00,
      "percentage": 26.67
    },
    "termDeposit": {
      "category": "termDeposit",
      "amount": 35000.00,
      "percentage": 23.33
    },
    "fund": {
      "category": "fund",
      "amount": 20000.00,
      "percentage": 13.33
    }
  }
}
```

---

## 4. Execution Plan & Next Steps

| Step | Scope | Description |
|---|---|---|
| **1** | `api` | Add `?baseCurrency` query param & FX rate normalization to `/api/investments/summary`. |
| **2** | `api` | Implement `GET /api/net-worth` combining accounts and investment services. |
| **3** | `web` | Create API clients and React Query hooks (`useNetWorth`, `useInvestmentSummary`). |
| **4** | `web` | Implement the main **Net Worth Dashboard Widget** and **Asset Allocation Chart** on the frontend. |
