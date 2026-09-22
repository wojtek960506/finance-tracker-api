# Frontend Integration Guide: Net Worth & Currency Normalization

## Overview

The backend now provides full support for portfolio currency normalization and a unified **Net Worth** endpoint combining liquid bank cash and investment portfolio assets into a single cohesive overview.

---

## 1. Endpoints Specification

### 1.1. Master Net Worth: `GET /api/net-worth`

Combines bank account balances (computed from transactions) and investment portfolio valuations.

- **Method**: `GET`
- **Route**: `/api/net-worth`
- **Auth**: Required (Bearer JWT)
- **Query Params**:
  - `baseCurrency` *(optional, string)*: e.g. `PLN`, `USD`, `EUR`. When provided, all totals and allocation amounts are converted to this currency using latest FX exchange rates.

#### TypeScript Contract

```typescript
export type NetWorthCategory = 'cash' | 'share' | 'fund' | 'termDeposit' | 'savings';

export interface NetWorthTotalsDTO {
  total: number;        // Liquid cash + total investments (normalized to baseCurrency if provided)
  liquidCash: number;   // Total balance across all bank accounts
  investments: number;  // Total valuation across all investment instruments
}

export interface NetWorthCurrencyBreakdownDTO {
  currency: string;
  cash: number;
  investments: number;
  total: number;
  normalizedTotal?: number; // Converted into baseCurrency (if baseCurrency provided)
}

export interface NetWorthAllocationItemDTO {
  category: NetWorthCategory;
  amount: number;      // Amount in baseCurrency (or raw if single currency)
  percentage: number;  // Percentage share (0 - 100), e.g. 36.67
}

export interface NetWorthResponseDTO {
  baseCurrency?: string;
  netWorth: NetWorthTotalsDTO;
  byCurrency: Record<string, NetWorthCurrencyBreakdownDTO>;
  allocation: Record<string, NetWorthAllocationItemDTO>;
}
```

#### Example Response (`GET /api/net-worth?baseCurrency=PLN`)

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

### 1.2. Enhanced Investment Summary: `GET /api/investments/summary`

- **Query Params**:
  - `baseCurrency` *(optional, string)*: e.g. `PLN`
- **Enhancements**:
  - Adds optional `grandTotalNormalized` aggregating the whole portfolio in the chosen currency.
  - Adds optional `normalizedTotalCurrentValue`, `normalizedTotalNetInvested`, `normalizedTotalPnL` to each currency in `totalsByCurrency`.

#### TypeScript Contract Extension

```typescript
export interface InvestmentGrandTotalNormalizedDTO {
  currentValue: number;
  netInvested: number;
  pnl: number;
  roiPercentage: number;
}

export interface InvestmentCurrencySummaryDTO {
  currency: string;
  totalCurrentValue: number;
  totalNetInvested: number;
  totalBought: number;
  totalSold: number;
  totalInterest: number;
  totalFees: number;
  totalPnL: number;
  roiPercentage: number;
  instrumentsCount: number;
  // Normalized fields (present when baseCurrency is requested)
  normalizedTotalCurrentValue?: number;
  normalizedTotalNetInvested?: number;
  normalizedTotalPnL?: number;
}

export interface InvestmentSummaryResponseDTO {
  baseCurrency?: string;
  grandTotalNormalized?: InvestmentGrandTotalNormalizedDTO;
  totalsByCurrency: Record<string, InvestmentCurrencySummaryDTO>;
  instruments: InvestmentInstrumentSummaryDTO[];
}
```

---

## 2. Frontend Changes in `finance-tracker-web-v2`

### Step 1: Update API Client & Types

1. **Create Net Worth API client** in `src/features/net-worth/api/get-net-worth.ts` (or `src/features/dashboard/api/`):
   ```typescript
   export const getNetWorth = async (params?: { baseCurrency?: string }): Promise<NetWorthResponseDTO> => {
     const response = await apiClient.get('/api/net-worth', { params });
     return response.data;
   };
   ```

2. **Update Investment Summary API client** in `src/features/investments/api/get-investment-summary.ts`:
   - Accept optional `params?: { baseCurrency?: string }`.
   - Update `InvestmentSummaryResponseDTO` type definition with `baseCurrency`, `grandTotalNormalized`, and currency normalized fields.

---

### Step 2: React Query Hooks

1. **Create `useNetWorth` hook** in `src/features/net-worth/hooks/use-net-worth.ts`:
   ```typescript
   export const useNetWorth = (baseCurrency?: string) => {
     return useQuery({
       queryKey: ['net-worth', baseCurrency],
       queryFn: () => getNetWorth({ baseCurrency }),
       staleTime: 1000 * 60 * 2, // 2 minutes
     });
   };
   ```

2. **Update `useInvestmentSummary` hook** in `src/features/investments/hooks/use-investment-summary.ts`:
   - Pass `baseCurrency` to query key `['investments', 'summary', baseCurrency]`.

---

### Step 3: UI Components to Add & Update

1. **Top Dashboard / Net Worth Widget**:
   - Display total net worth (e.g. `150 000.00 PLN`).
   - Show sub-breakdown: **Liquid Cash** (bank accounts) vs. **Investments**.
   - Include base currency selector (e.g. `PLN`, `USD`, `EUR`) to switch normalization.

2. **Asset Allocation Chart / Breakdown**:
   - Render Donut / Progress chart with categories from `allocation`:
     - `cash`: Liquid cash in bank accounts
     - `share`: Stocks / equities
     - `fund`: Mutual / index funds
     - `termDeposit`: Fixed-term deposits
     - `savings`: Savings accounts
   - Show category name, formatted monetary amount, and percentage.

3. **Multi-Currency Breakdown Cards**:
   - Render pill / list for `byCurrency` showing per-currency cash + investment split.

4. **Investments Summary Page**:
   - Use `grandTotalNormalized` to show unified multi-currency portfolio ROI and total value when viewing in normalized mode.

---

### Step 4: Translations (i18n)

Add translations for categories in `locales/{en,pl,ru}/`:

```json
{
  "netWorth": {
    "title": "Net Worth",
    "liquidCash": "Liquid Cash",
    "investments": "Investments",
    "total": "Total Net Worth",
    "assetAllocation": "Asset Allocation",
    "categories": {
      "cash": "Cash & Accounts",
      "share": "Stocks & Equities",
      "fund": "Funds & ETFs",
      "termDeposit": "Term Deposits",
      "savings": "Savings Accounts"
    }
  }
}
```
