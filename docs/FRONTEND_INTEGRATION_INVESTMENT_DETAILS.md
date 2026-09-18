# Frontend Integration Guide: Investment Details & Portfolio Metrics

## Overview

The backend now serves as the **single source of truth** for all investment calculations (portfolio overview and individual instrument details). 

Previously, the frontend had to fetch raw operations and compute valuation / net invested / returns client-side (which caused `None` to display when no snapshots were present, and led to math discrepancies for savings accounts with interest).

Now, **`GET /api/investments/instruments/:id`** automatically computes and returns full summary metrics on the fly.

---

## 1. Updated Endpoint: `GET /api/investments/instruments/:id`

### Response Structure (`InvestmentInstrumentSummaryDTO`)

```typescript
export interface InvestmentInstrumentSummaryDTO {
  id: string;
  name: string;
  kind: 'share' | 'bond' | 'etf' | 'crypto' | 'commodity' | 'currency' | 'real_estate' | 'fund' | 'termDeposit' | 'savings_account';
  currency: string; // e.g. "PLN", "USD", "EUR"
  
  // === Pre-calculated Metrics ===
  currentValue: number;       // Latest snapshot amount ?? (totalBought - totalSold + totalInterest - totalFees)
  netInvested: number;        // Principal out-of-pocket (totalBought + totalFees - totalSold, or 0 if closed)
  totalBought: number;        // Sum of all 'buy' operations
  totalSold: number;          // Sum of all 'sell' operations
  totalInterest: number;      // Sum of all 'interest' operations
  totalFees: number;          // Sum of all 'fee' operations
  pnl: number;                // Lifetime return / profit (currentValue + totalSold - (totalBought + totalFees))
  roiPercentage: number;      // (pnl / totalCostBasis) * 100
  lastSnapshotDate: string | null; // ISO Date of the latest snapshot operation, if any
  operationsCount: number;    // Total count of operations for this instrument

  // === Metadata ===
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Example JSON Response

```json
{
  "id": "60c72b2f9b1d8b001c8e4c01",
  "name": "PKO Konto Oszczędnościowe",
  "kind": "savings_account",
  "currency": "PLN",
  "currentValue": 61673.42,
  "netInvested": 61500.00,
  "totalBought": 64164.11,
  "totalSold": 2664.11,
  "totalInterest": 173.42,
  "totalFees": 0,
  "pnl": 173.42,
  "roiPercentage": 0.27,
  "lastSnapshotDate": null,
  "operationsCount": 3,
  "notes": "Main savings account",
  "createdAt": "2026-01-10T12:00:00.000Z",
  "updatedAt": "2026-03-01T12:00:00.000Z"
}
```

---

## 2. Frontend Changes in `finance-tracker-web-v2`

### 1. Update API Types in `src/features/investments/api/get-instrument.ts`
Update the return type of `getInstrument(id)` from `InvestmentInstrumentResponseDTO` to `InvestmentInstrumentSummaryDTO`.

### 2. Simplify `use-instrument-details.ts`
Previously, `use-instrument-details.ts` executed custom calculation logic on raw operations. You can now simplify it:

- **Metric Cards (Current Valuation, Net Invested, Total Return, Total Bought, etc.)**:  
  Read directly from `instrumentQuery.data` (e.g., `instrument.currentValue`, `instrument.netInvested`, `instrument.pnl`, `instrument.roiPercentage`).
- **Operations List**:  
  Continue fetching `GET /api/investments/operations?instrumentId=${id}` solely to render the operations table/history.

---

## 3. Calculation Engine Logic Reference

| Metric | Formula | Behavior |
| :--- | :--- | :--- |
| **Current Value** | `Latest Snapshot ?? (Buy - Sell + Interest - Fees)` | Fallback automatically accounts for accrued savings interest and internal fees without requiring a manual snapshot. |
| **Net Invested** | `Buy - Sell` (or `0` if position is closed) | Tracks actual net cash deposited out-of-pocket (does not subtract interest). Drops to `0` when `currentValue === 0`. |
| **Total Return (PnL)**| `Current Value + Sell - Buy` | Accurate lifetime return (both realized profit from sells and unrealized value) equal to `Interest - Fees`. |
| **ROI %** | `(PnL / Buy) * 100` | Return on total invested capital. |
