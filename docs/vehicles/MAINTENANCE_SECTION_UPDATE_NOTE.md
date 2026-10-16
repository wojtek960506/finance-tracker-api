# 📢 Frontend Handover: Maintenance Domain Updates & Calculation Rules

This document outlines the API updates to the Vehicle Maintenance domain and the business logic rules for totals and odometer metrics that need to be reflected in the frontend (`finance-tracker-web-v2`).

---

## 1. `MaintenanceSection` Type Updated

The `'driving_licence_costs'` section enum has been removed and subsumed under `'ownMaintenance'`. 

The maintenance section type is now strictly two options:

```typescript
export type MaintenanceSection = 'ownMaintenance' | 'previousOwnerServices';
```

> **Note**: Any personal, administrative, or licensing fees (e.g., driver medical exam, license renewal fees) should simply be logged under **`ownMaintenance`** with an appropriate description (e.g., *"Driving licence medical examination"*).

---

## 2. UI & Form Adjustments

1. **Section Switcher / Filter Pills**:
   - Update from 3 pills to 2 tabs/pills:
     - 🔧 **Own Maintenance** (`ownMaintenance`)
     - 📋 **Previous Owner Services** (`previousOwnerServices`)
   - Remove the `driving_licence_costs` pill.
2. **Maintenance Modals (`CreateMaintenanceModal` & `UpdateMaintenanceModal`)**:
   - Update the Section dropdown field options to only include `ownMaintenance` and `previousOwnerServices`.
3. **Filter Bar**:
   - Remove `driving_licence_costs` from any section filter dropdown.
4. **Localization (`i18n`)**:
   - Remove or deprecate `driving_licence_costs` across vehicle locale files (`de`, `en`, `pl`, `ru`).

---

## 3. ⚠️ Calculation & Summary Totals Rules

Please ensure all frontend summary cards, overview widgets, and total metrics follow these rules:

### A. Spending Totals (`costPln`)
- **`previousOwnerServices` is strictly informational**:
  - The cost stored in `previousOwnerServices` records was incurred by the previous owner before acquisition.
  - **Do NOT** include `previousOwnerServices` costs in vehicle spending totals, total cost of ownership, or maintenance summary totals.
  - Only **`ownMaintenance`** records count towards the vehicle's financial expenses.

### B. Odometer & Mileage Tracking (`odometerKm`)
- The `odometerKm` in `previousOwnerServices` is for historical reference only.
- **Do NOT** use `previousOwnerServices` odometer readings as the vehicle's latest odometer, nor as a baseline for current owner mileage or fuel consumption deltas.
