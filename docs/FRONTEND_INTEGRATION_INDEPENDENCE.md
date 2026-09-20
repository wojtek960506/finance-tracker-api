# 📊 Frontend Integration Guide: Financial Independence & Safety Buffer (`GET /api/net-worth/independence`)

This guide describes how to integrate the **Financial Independence and Liquid Safety Buffer** endpoint into the frontend application (`finance-tracker-web-v2`).

---

## 1. Endpoint Overview

* **URL**: `/api/net-worth/independence`
* **Method**: `GET`
* **Authentication**: Bearer JWT (Access Token)
* **Description**: Calculates how many months a user can sustain their lifestyle without working, based on current net worth / liquid funds and historical living expenses / passive non-work incomes over a configurable analysis period (default: 12 months).

---

## 2. Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `baseCurrency` | `string` | No | `undefined` | Target currency for normalization (e.g. `PLN`, `USD`, `EUR`). |
| `periodMonths` | `number` | No | `12` | Number of past months to sample for monthly averages (1–120). |
| `startDate` | `string` (ISO) | No | `now - periodMonths` | Custom start date for historical transaction analysis. |
| `endDate` | `string` (ISO) | No | `now` | Custom end date for historical transaction analysis. |
| `excludeCategoryIds` | `string` (comma-sep) | No | Auto-detected | Specific category ObjectIds to exclude from non-work income. |
| `excludeCategoryNames` | `string` (comma-sep) | No | Auto-detected | Specific category names to exclude (e.g. `Praca, B2B, Salary`). |

> [!TIP]
> **Automatic Work Category Detection**: If neither `excludeCategoryIds` nor `excludeCategoryNames` is provided, the API automatically detects and excludes all categories matching work/salary patterns (`praca`, `work`, `salary`, `wynagrodzenie`, `zarobki`, `etat`, `b2b`) case-insensitively.

---

## 3. TypeScript Interfaces

```typescript
export type CurrencyCode = 'PLN' | 'USD' | 'EUR' | 'GBP' | 'CHF' | string;

export interface NetWorthIndependencePeriodDTO {
  startDate: string;
  endDate: string;
  monthsCount: number;
}

export interface NetWorthIndependenceCapitalDTO {
  total: number;             // Total Net Worth (cash + savings + shares + funds + deposits)
  liquidCash: number;        // Bank checking / transaction accounts only
  savings: number;           // Instant-access savings accounts & sub-accounts (skarbonki)
  liquidCapital: number;     // liquidCash + savings (immediately accessible funds)
  lockedInvestments: number; // shares + funds + term deposits
}

export interface NetWorthIndependenceMonthlyAveragesDTO {
  grossExpenses: number;     // Average monthly living expenses
  nonWorkIncome: number;     // Friend reimbursements, cashbacks, refunds, dividends
  workIncome: number;        // Excluded employment / salary income
  totalIncome: number;       // Average total income
  netBurnRate: number;       // Real net monthly outflow (grossExpenses - nonWorkIncome)
}

export interface NetWorthIndependenceHorizonDTO {
  netWorthMonths: number | null;      // Months if entire net worth is utilized (null if isPerpetual)
  liquidCapitalMonths: number | null; // Months using cash + savings only (null if isPerpetual)
  liquidCashMonths: number | null;    // Months using bank accounts only (null if isPerpetual)
  isPerpetual: boolean;               // True if non-work income covers 100%+ of expenses
}

export interface NetWorthZeroIncomeBaselineDTO {
  netWorthMonths: number | null;      // Months on net worth assuming $0 income (grossExpenses)
  liquidCapitalMonths: number | null; // Months on cash + savings assuming $0 income
  liquidCashMonths: number | null;    // Months on bank cash assuming $0 income
}

export interface ExcludedCategoryItemDTO {
  id: string;
  name: string;
}

export interface NetWorthIndependenceResponseDTO {
  baseCurrency?: CurrencyCode;
  period: NetWorthIndependencePeriodDTO;
  netWorth: NetWorthIndependenceCapitalDTO;
  monthlyAverages: NetWorthIndependenceMonthlyAveragesDTO;
  independence: NetWorthIndependenceHorizonDTO;
  zeroIncomeBaseline: NetWorthZeroIncomeBaselineDTO;
  excludedCategories: ExcludedCategoryItemDTO[];
}
```

---

## 4. Example API Response (`GET /api/net-worth/independence?baseCurrency=PLN&periodMonths=12`)

```json
{
  "baseCurrency": "PLN",
  "period": {
    "startDate": "2025-09-19T11:20:00.000Z",
    "endDate": "2026-09-19T11:20:00.000Z",
    "monthsCount": 12
  },
  "netWorth": {
    "total": 231200.00,
    "liquidCash": 61200.00,
    "savings": 30000.00,
    "liquidCapital": 91200.00,
    "lockedInvestments": 140000.00
  },
  "monthlyAverages": {
    "grossExpenses": 6000.00,
    "nonWorkIncome": 500.00,
    "workIncome": 12000.00,
    "totalIncome": 12500.00,
    "netBurnRate": 5500.00
  },
  "independence": {
    "netWorthMonths": 42.04,
    "liquidCapitalMonths": 16.58,
    "liquidCashMonths": 11.13,
    "isPerpetual": false
  },
  "zeroIncomeBaseline": {
    "netWorthMonths": 38.53,
    "liquidCapitalMonths": 15.20,
    "liquidCashMonths": 10.20
  },
  "excludedCategories": [
    {
      "id": "60d0fe4f5311236168a109ca",
      "name": "Wynagrodzenie / Praca"
    }
  ]
}
```

---

## 5. UI Card Recommendations & Polish Translations

### Primary Metrics to Display:

1. **Niezależność finansowa (Financial Independence Horizon)**:
   * **Value**: `independence.netWorthMonths` (e.g. `42,0 mies.` / `3 lata i 6 mies.`)
   * **Subtitle**: *„Całkowity czas przeżycia z całego majątku netto.”*

2. **Poduszka płynna (Liquid Safety Buffer)**:
   * **Value**: `independence.liquidCapitalMonths` (e.g. `16,6 mies.`)
   * **Subtitle**: *„Środki dostępne od ręki (konta bankowe + oszczędności) bez wyprzedawania akcji i funduszy.”*

3. **Miesięczny koszt życia netto (Net Burn Rate)**:
   * **Value**: `monthlyAverages.netBurnRate` (e.g. `5 500,00 PLN / mies.`)
   * **Detail**: `Wydatki: 6 000 PLN | Wpływy poza pracą / zwroty: 500 PLN`

4. **Wariant konserwatywny (0-Income Stress Test)**:
   * **Value**: `zeroIncomeBaseline.netWorthMonths` (e.g. `38,5 mies.`)
   * **Tooltip**: *„Szacowany czas, gdyby ustały wszelkie wpływy i zwroty.”*
