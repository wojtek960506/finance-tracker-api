# Frontend Integration Guidelines: Vehicles Domain Updates & New Contracts

This guide documents the updated API contracts, architectural enhancements, and migration paths for the **Vehicles domain** in `finance-tracker-api`. It builds directly upon [`docs/FRONTEND_INTEGRATION_VEHICLES.md`](./FRONTEND_INTEGRATION_VEHICLES.md) and highlights the key features requested by and coordinated with the frontend.

---

## 🚀 Key Highlights & Architectural Changes

| Feature / Area | Previous Proposal | Implemented Reality | Benefit for Frontend |
|---|---|---|---|
| **Sub-resource Responses** | Separate shapes (e.g. `{ entries, stats }` for fuel vs raw arrays for equipment/maintenance) | **Unified Envelope**: `{ items, summary, pagination }` across all 3 sub-resources | Single, consistent frontend data fetching and caching pattern |
| **Pagination Model** | Offset-based (`page` & `limit`) | **Cursor-based**: `cursor` & `limit` query params returning `{ nextCursor, hasMore, total }` | Perfect for infinite scroll / "load more" without duplicate items or skipped records |
| **Fleet & Vehicle Summaries** | Missing dedicated aggregation endpoints | Added `GET /api/vehicles/summary` and `GET /api/vehicles/:identifier/overview` | Zero client-side computation needed for fleet dashboards or vehicle detail header cards |
| **Maintenance Sections** | `snake_case` (`own_maintenance`, `previous_owner_services`) | **`camelCase`**: `'ownMaintenance'` and `'previousOwnerServices'` | Direct alignment with frontend domain models and camelCase conventions |
| **Maintenance Query Isolation** | Mixed stream | Query defaults to `section=ownMaintenance`; queries for `previousOwnerServices` keep summary totals at `0` | Clean separation between active ownership spendings and previous owner history |
| **Database Source Rows** | `sourceRow` tracked in schemas and DTOs | **Completely Removed** | Simplified DTOs; relational linkages handled dynamically in-memory |

---

## 1. Unified Sub-Resource List Contract

All three sub-resource list endpoints (`/fuel`, `/maintenance`, `/equipment`) now return an identical envelope structure:

```typescript
export interface VehicleSubResourceListResponse<TItem, TSummary> {
  items: TItem[];
  summary: TSummary;
  pagination: VehiclePaginationDTO;
}

export interface VehiclePaginationDTO {
  nextCursor: string | null; // Opaque base64url cursor; pass as ?cursor=... in next request
  hasMore: boolean;          // true if more items exist
  total: number;             // Total count of matching records for this filter/section
}
```

### Query Parameters (Uniform across Fuel, Maintenance, Equipment)
- `cursor` *(optional, string)*: The `nextCursor` value from the previous page.
- `limit` *(optional, number, min: 1, max: 100, default: 50)*: Number of items to fetch.
- `startDate` / `endDate` *(optional, ISO date string)*: Filter records by date range.

---

## 2. Sub-Resource Details & Summaries

### 2.1. Fuel (`GET /api/vehicles/:identifier/fuel`)

#### Additional Query Filters
- `isFullTank` *(optional, boolean)*: Filter by full tank refuels only.
- `enriched` *(optional, boolean, default: `true`)*: When `false`, returns raw logs without calculating delta distances and consumption rates.

#### Response Envelope Shape
```typescript
interface VehicleFuelWithSummaryResponseDTO {
  items: EnrichedVehicleFuelEntryDTO[];
  summary: {
    totalVolume: number;                 // Total liters refueled
    totalCostPln: number;                // Total refuel spending
    avgConsumptionLPer100Km: number | null; // Weighted average consumption
    avgUnitPricePln: number | null;         // Weighted average cost per liter
    totalCount: number;                  // Number of refuel records
  };
  pagination: VehiclePaginationDTO;
}
```

> **Derived Metrics**:
> Each item in `items` includes derived fields:
> `distanceSincePreviousKm`, `distanceSincePreviousFullKm`, `fuelLitersToFull`, `costToFullPln`, `consumptionLPer100Km`, `costPerKmPln`, and `kmPerLiter`. Baseline fill-ups have `null` for distance and consumption.

---

### 2.2. Maintenance (`GET /api/vehicles/:identifier/maintenance`)

#### Additional Query Filters
- `section` *(optional, `'ownMaintenance' | 'previousOwnerServices'`, default: `'ownMaintenance'`)*

#### Response Envelope Shape
```typescript
interface VehicleMaintenanceWithSummaryResponseDTO {
  items: VehicleMaintenanceResponseDTO[];
  summary: {
    totalCostPln: number; // Sum of costPln (strictly 0 when section='previousOwnerServices')
    totalRecords: number; // Count of records (strictly 0 when section='previousOwnerServices')
  };
  pagination: VehiclePaginationDTO;
}
```

#### Frontend Integration Rules:
1. **Own Maintenance Tab/Card**:
   - Query without `section` or pass `?section=ownMaintenance`.
   - `summary.totalCostPln` reflects active ownership spending.
   - `pagination.total` reflects the count of own maintenance records.
2. **Previous Owner History Tab/Card**:
   - Query with `?section=previousOwnerServices`.
   - `summary.totalCostPln` will always return `0` (enforcing the business rule that prior owner expenses never taint user finances).
   - `pagination.total` reflects the total count of previous owner records for pagination.

---

### 2.3. Equipment (`GET /api/vehicles/:identifier/equipment`)

#### Response Envelope Shape
```typescript
interface VehicleEquipmentWithSummaryResponseDTO {
  items: VehicleEquipmentResponseDTO[];
  summary: {
    totalCostPln: number; // Total spent on equipment & accessories
    totalItems: number;   // Total equipment entries
  };
  pagination: VehiclePaginationDTO;
}
```

---

## 3. High-Level Summary & Overview Endpoints

To avoid making 3 or 4 separate API calls to populate vehicle headers, dashboard cards, and fleet metrics, use these two dedicated endpoints:

### 3.1. Fleet-Wide Summary (`GET /api/vehicles/summary`)
Returns aggregate spending and distance statistics across all user vehicles:

```typescript
// GET /api/vehicles/summary
interface FleetSummaryResponseDTO {
  totalCostPln: number;
  totalDistanceKm: number;
  byCategory: {
    fuel: {
      totalCostPln: number;
      totalCount: number;
      totalVolume: number;
      avgConsumptionLPer100Km: number | null;
      avgUnitPricePln: number | null;
      totalDistanceKm: number;
    };
    maintenance: {
      totalCostPln: number;
      totalCount: number;
    };
    equipment: {
      totalCostPln: number;
      totalCount: number;
    };
  };
  byVehicle: Array<{
    vehicleId: string;
    vehicleName: string;
    slug: string;
    type: 'motorcycle' | 'car' | 'public_transport';
    totalCostPln: number;
    totalDistanceKm: number;
  }>;
}
```

### 3.2. Single Vehicle Overview (`GET /api/vehicles/:identifier/overview`)
Returns the complete status for a vehicle's detail page header, including current odometer, spendings breakdown, and recent activity previews:

```typescript
// GET /api/vehicles/:identifier/overview
interface VehicleOverviewResponseDTO {
  vehicle: VehicleResponseDTO;
  stats: {
    currentOdometerKm: number | null;    // Latest recorded odometer reading
    totalDistanceKm: number;             // Distance tracked under user ownership
    totalCostPln: number;                // Grand total (Fuel + Equipment + Own Maintenance)
    spendingsBreakdown: {
      fuelCostPln: number;
      maintenanceCostPln: number;        // Excludes previousOwnerServices
      equipmentCostPln: number;
    };
    fuelStats: {
      totalVolume: number;
      avgConsumptionLPer100Km: number | null;
      avgUnitPricePln: number | null;
      refuelCount: number;
    };
    counts: {
      fuelEntries: number;
      maintenanceRecords: number;        // Own maintenance count
      previousOwnerRecords: number;      // Prior owner history count
      equipmentItems: number;
    };
  };
  latestActivity: {
    latestFuel: EnrichedVehicleFuelEntryDTO | null;
    latestMaintenance: VehicleMaintenanceResponseDTO | null;
    latestEquipment: VehicleEquipmentResponseDTO | null;
  };
}
```

---

## 4. Frontend Infinite Scrolling / Cursor Recipe

With cursor-based pagination, implementing TanStack Query / SWR `useInfiniteQuery` is straightforward:

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export function useVehicleFuelList(vehicleIdentifier: string) {
  return useInfiniteQuery({
    queryKey: ['vehicles', vehicleIdentifier, 'fuel'],
    queryFn: async ({ pageParam }) => {
      const url = new URL(`/api/vehicles/${vehicleIdentifier}/fuel`, window.location.origin);
      url.searchParams.set('limit', '20');
      if (pageParam) {
        url.searchParams.set('cursor', pageParam);
      }
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      return res.json() as Promise<VehicleFuelWithSummaryResponseDTO>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : null),
  });
}
```

---

## 5. Summary of Frontend Action Items

1. **Regenerate OpenAPI Types**:
   - Run the frontend API generator against the latest `openapi.json` from the backend.
2. **Update Sub-Resource Queries**:
   - Change list response access from array or `{ entries, stats }` to `{ items, summary, pagination }`.
   - Change pagination state from `page: number` to `cursor: string | null`.
3. **Update Maintenance Section Keys**:
   - Replace any references to `'own_maintenance'` with `'ownMaintenance'`.
   - Replace any references to `'previous_owner_services'` with `'previousOwnerServices'`.
4. **Leverage Overview & Summary**:
   - Use `GET /api/vehicles/:identifier/overview` to populate vehicle detail header cards and stats widgets in a single request.
   - Use `GET /api/vehicles/summary` for the main vehicle fleet dashboard.
