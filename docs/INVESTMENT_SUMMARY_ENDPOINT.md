# Frontend Integration Note: Investment Portfolio Summary Endpoint

## 1. Endpoint Overview

- **Method**: `GET`
- **Route**: `/api/investments/summary`
- **Auth**: Required (Bearer token / session cookie)

---

## 2. Calculation Logic & Fallback Behavior

### Valuation & Return Metrics

- **Current Value**:
  ```text
  Current Value = Latest Snapshot Value ?? (Total Bought - Total Sold)
  ```
  *(If no snapshot has been recorded yet, the current value defaults to net units/capital bought minus sold. No manual snapshot is required for calculations to work right away).*

- **Net Invested**:
  ```text
  Net Invested = (Total Bought + Total Fees) - Total Sold - Total Interest
  ```

- **Profit & Loss (PnL)**:
  ```text
  PnL = Current Value + Total Sold + Total Interest - (Total Bought + Total Fees)
  ```

- **ROI (%)**:
  ```text
  ROI % = (PnL / (Total Bought + Total Fees)) * 100
  ```

- **Multi-Currency Totals**:
  Totals (`totalsByCurrency`) are aggregated separately for each currency code (e.g. `PLN`, `USD`, `EUR`) to avoid cross-currency skew.

---

## 3. TypeScript Contracts

```typescript
export interface InvestmentInstrumentSummary {
  id: string;
  name: string;
  kind: 'share' | 'fund' | 'termDeposit' | 'savings';
  currency: string;
  currentValue: number;
  netInvested: number;
  totalBought: number;
  totalSold: number;
  totalInterest: number;
  totalFees: number;
  pnl: number;
  roiPercentage: number;
  lastSnapshotDate: string | null;
  operationsCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentCurrencySummary {
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
}

export interface InvestmentSummaryResponse {
  totalsByCurrency: Record<string, InvestmentCurrencySummary>;
  instruments: InvestmentInstrumentSummary[];
}
```

---

## 4. Example Response

```json
{
  "totalsByCurrency": {
    "USD": {
      "currency": "USD",
      "totalCurrentValue": 12500.00,
      "totalNetInvested": 10000.00,
      "totalBought": 10000.00,
      "totalSold": 0.00,
      "totalInterest": 0.00,
      "totalFees": 0.00,
      "totalPnL": 2500.00,
      "roiPercentage": 25.0,
      "instrumentsCount": 1
    },
    "PLN": {
      "currency": "PLN",
      "totalCurrentValue": 10000.00,
      "totalNetInvested": 9750.00,
      "totalBought": 10000.00,
      "totalSold": 0.00,
      "totalInterest": 250.00,
      "totalFees": 0.00,
      "totalPnL": 250.00,
      "roiPercentage": 2.5,
      "instrumentsCount": 1
    }
  },
  "instruments": [
    {
      "id": "66ea9d1b033cf852109e452a",
      "name": "Apple Inc. (AAPL)",
      "kind": "share",
      "currency": "USD",
      "currentValue": 12500.00,
      "netInvested": 10000.00,
      "totalBought": 10000.00,
      "totalSold": 0.00,
      "totalInterest": 0.00,
      "totalFees": 0.00,
      "pnl": 2500.00,
      "roiPercentage": 25.0,
      "lastSnapshotDate": "2026-09-17T00:00:00.000Z",
      "operationsCount": 2,
      "notes": "Tech holding",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-09-17T00:00:00.000Z"
    },
    {
      "id": "66ea9d1b033cf852109e452b",
      "name": "Lokata 3M PKO",
      "kind": "termDeposit",
      "currency": "PLN",
      "currentValue": 10000.00,
      "netInvested": 9750.00,
      "totalBought": 10000.00,
      "totalSold": 0.00,
      "totalInterest": 250.00,
      "totalFees": 0.00,
      "pnl": 250.00,
      "roiPercentage": 2.5,
      "lastSnapshotDate": null,
      "operationsCount": 2,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-04-01T00:00:00.000Z"
    }
  ]
}
```

---

## 5. Frontend API Function Example

```typescript
export async function getInvestmentSummary(): Promise<InvestmentSummaryResponse> {
  const response = await api.get<InvestmentSummaryResponse>('/api/investments/summary');
  return response.data;
}
```
