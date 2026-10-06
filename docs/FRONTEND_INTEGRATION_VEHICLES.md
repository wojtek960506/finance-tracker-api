# Frontend Integration Guide: Vehicle Management Domain

## Overview

The backend provides a complete **Vehicle Management** domain under `/api/vehicles`. It supports full lifecycle management of vehicles, fuel logs with dynamic consumption analytics, maintenance records, equipment/accessories tracking, and cross-domain linking with finance transactions.

All endpoints require authentication via Bearer Access Token in the `Authorization: Bearer <token>` header.

---

## 1. Domain Overview & Resource Hierarchy

```
/api/vehicles
├── /                                         # List & Create vehicles
├── /:identifier                              # Get, Update, Delete vehicle (by _id or slug)
│   ├── /fuel                                 # Fuel logs (metrics, stats, create)
│   │   └── /:entryId                         # Get, Update, Delete fuel entry
│   ├── /maintenance                          # Maintenance records (sections, create)
│   │   └── /:recordId                        # Get, Update, Delete maintenance record
│   └── /equipment                            # Equipment & accessories (create, list)
│       └── /:itemId                          # Get, Update, Delete equipment item
└── /spendings
    ├── /link                                 # Link fuel/equipment/maint to transaction
    └── /unlink                               # Unlink spending from transaction
```

> **Note on `:identifier`**: All vehicle sub-routes accept either the MongoDB `_id` (24-hex string) OR the vehicle `slug` (e.g. `suzuki-sv-650`).

---

## 2. TypeScript Types & Contracts

```typescript
// --- Core Vehicle Types ---
export type VehicleType = 'motorcycle' | 'car' | 'public_transport';

export interface VehicleCreateDTO {
  name: string;
  brand?: string;
  vehicleModel?: string;
  type: VehicleType;
  productionYear?: number;
  notes?: string;
}

export type VehicleUpdateDTO = Partial<VehicleCreateDTO>;

export interface VehicleResponseDTO {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  brand?: string;
  vehicleModel?: string;
  type: VehicleType;
  productionYear?: number;
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// --- Fuel Log Types ---
export interface VehicleFuelCreateDTO {
  date: string; // ISO date string
  fuelLiters: number;
  isFullTank: boolean;
  unitPricePln: number;
  costPln: number;
  odometerKm?: number;
  stationBrand?: string;
  stationAddress?: string;
  description?: string;
  transactionId?: string | null;
}

export type VehicleFuelUpdateDTO = Partial<VehicleFuelCreateDTO>;

export interface EnrichedVehicleFuelEntryDTO {
  id: string;
  ownerId: string;
  vehicleId: string;
  date: string;
  fuelLiters: number;
  isFullTank: boolean;
  unitPricePln: number;
  costPln: number;
  odometerKm?: number;
  stationBrand?: string;
  stationAddress?: string;
  description?: string;
  transactionId?: string | null;
  // Dynamically computed metrics (computed in memory):
  distanceSinceLastFueling?: number;
  consumptionPer100Km?: number;
  costPerKm?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFuelStatsDTO {
  totalFuelLiters: number;
  totalCostPln: number;
  totalDistanceKm: number;
  averageConsumptionPer100Km?: number;
  averageCostPerKm?: number;
  entriesCount: number;
}

export interface VehicleFuelListResponseDTO {
  entries: EnrichedVehicleFuelEntryDTO[];
  stats: VehicleFuelStatsDTO;
}

// --- Maintenance Types ---
export type MaintenanceSection =
  | 'own_maintenance'
  | 'previous_owner_services'
  | 'driving_licence_costs';

export interface VehicleMaintenanceCreateDTO {
  section: MaintenanceSection;
  date: string; // ISO date string
  costPln: number;
  odometerKm?: number;
  description?: string;
  serviceProvider?: string;
  transactionId?: string | null;
}

export type VehicleMaintenanceUpdateDTO = Partial<VehicleMaintenanceCreateDTO>;

export interface VehicleMaintenanceResponseDTO {
  id: string;
  ownerId: string;
  vehicleId: string;
  section: MaintenanceSection;
  date: string;
  costPln: number;
  odometerKm?: number;
  description?: string;
  serviceProvider?: string;
  transactionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Equipment Types ---
export interface VehicleEquipmentCreateDTO {
  date: string; // ISO date string
  itemName: string;
  costPln: number;
  description?: string;
  transactionId?: string | null;
}

export type VehicleEquipmentUpdateDTO = Partial<VehicleEquipmentCreateDTO>;

export interface VehicleEquipmentResponseDTO {
  id: string;
  ownerId: string;
  vehicleId: string;
  date: string;
  itemName: string;
  costPln: number;
  description?: string;
  transactionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Spending Link Types ---
export type SpendingType = 'fuel' | 'equipment' | 'maintenance';

export interface SpendingLinkItemDTO {
  spendingType: SpendingType;
  spendingId: string;
}

export interface LinkSpendingsToTransactionDTO {
  transactionId: string;
  spendings: SpendingLinkItemDTO[];
}

export interface UnlinkSpendingFromTransactionDTO {
  spendingType: SpendingType;
  spendingId: string;
}

export interface SpendingLinkResponseDTO {
  acknowledged: boolean;
  modifiedCount: number;
}
```

---

## 3. Endpoints Specification

### 3.1. Vehicles

#### `GET /api/vehicles`
- **Query Params**:
  - `page` *(optional, number, default: 1)*
  - `limit` *(optional, number, min: 1, max: 100, default: 50)*
  - `type` *(optional, `'motorcycle' | 'car' | 'public_transport'`)*
  - `search` *(optional, string, searches in name/brand/model)*
  - `sortBy` *(optional, `'name' | 'createdAt' | 'updatedAt'`, default: `'createdAt'`)*
  - `sortOrder` *(optional, `'asc' | 'desc'`, default: `'desc'`)*
- **Response**: `200 OK` $\rightarrow$ `VehicleResponseDTO[]`

#### `POST /api/vehicles`
- **Body**: `VehicleCreateDTO`
- **Response**: `201 Created` $\rightarrow$ `VehicleResponseDTO`
- **Errors**: `409 Conflict` (`VEHICLE_NAME_ALREADY_EXISTS_ERROR` or `VEHICLE_SLUG_ALREADY_EXISTS_ERROR` if name produces a collision for this user).

#### `GET /api/vehicles/:identifier`
- **Params**: `identifier` (either vehicle `_id` or `slug`)
- **Response**: `200 OK` $\rightarrow$ `VehicleResponseDTO`
- **Errors**: `404 Not Found` (`VEHICLE_NOT_FOUND_ERROR`).

#### `PATCH /api/vehicles/:identifier`
- **Params**: `identifier`
- **Body**: `VehicleUpdateDTO`
- **Response**: `200 OK` $\rightarrow$ `VehicleResponseDTO` (Slug automatically recalculates if `name` changed).

#### `DELETE /api/vehicles/:identifier`
- **Params**: `identifier`
- **Response**: `204 No Content`
- **Errors**: `403 Forbidden` (`VEHICLE_DEPENDENCY_ERROR`) if associated fuel, maintenance, or equipment records exist. Delete children first before deleting the vehicle.

---

### 3.2. Fuel Logs & Consumption Analytics

#### `GET /api/vehicles/:identifier/fuel`
- **Query Params**:
  - `isFullTank` *(optional, boolean)*
  - `startDate` *(optional, ISO date string)*
  - `endDate` *(optional, ISO date string)*
  - `page` *(optional, number, default: 1)*
  - `limit` *(optional, number, default: 50)*
- **Response**: `200 OK` $\rightarrow$ `VehicleFuelListResponseDTO` (`{ entries: [...], stats: {...} }`)
- **Notes**: Returns enriched logs sorted newest-first with calculated metrics (`consumptionPer100Km`, `costPerKm`, `distanceSinceLastFueling`).

#### `POST /api/vehicles/:identifier/fuel`
- **Body**: `VehicleFuelCreateDTO`
- **Response**: `201 Created` $\rightarrow$ `VehicleFuelEntryResponseDTO`
- **Odometer Sequence Rule**: Odometer must be chronologically valid. It cannot be lower than any earlier refuel or higher than any later refuel. Violations return `400 Bad Request` with `VEHICLE_ODOMETER_SEQUENCE_ERROR`.

#### `GET /api/vehicles/:identifier/fuel/:entryId`
- **Response**: `200 OK` $\rightarrow$ `VehicleFuelEntryResponseDTO`

#### `PATCH /api/vehicles/:identifier/fuel/:entryId`
- **Body**: `VehicleFuelUpdateDTO`
- **Response**: `200 OK` $\rightarrow$ `VehicleFuelEntryResponseDTO`

#### `DELETE /api/vehicles/:identifier/fuel/:entryId`
- **Response**: `204 No Content`

---

### 3.3. Maintenance Records

#### `GET /api/vehicles/:identifier/maintenance`
- **Query Params**:
  - `section` *(optional, `'own_maintenance' | 'previous_owner_services' | 'driving_licence_costs'`)*
  - `startDate` *(optional, ISO date string)*
  - `endDate` *(optional, ISO date string)*
  - `page` *(optional, number, default: 1)*
  - `limit` *(optional, number, default: 50)*
- **Response**: `200 OK` $\rightarrow$ `VehicleMaintenanceResponseDTO[]`

#### `POST /api/vehicles/:identifier/maintenance`
- **Body**: `VehicleMaintenanceCreateDTO`
- **Response**: `201 Created` $\rightarrow$ `VehicleMaintenanceResponseDTO`

#### `GET /api/vehicles/:identifier/maintenance/:recordId`
- **Response**: `200 OK` $\rightarrow$ `VehicleMaintenanceResponseDTO`

#### `PATCH /api/vehicles/:identifier/maintenance/:recordId`
- **Body**: `VehicleMaintenanceUpdateDTO`
- **Response**: `200 OK` $\rightarrow$ `VehicleMaintenanceResponseDTO`

#### `DELETE /api/vehicles/:identifier/maintenance/:recordId`
- **Response**: `204 No Content`

---

### 3.4. Equipment & Accessories

#### `GET /api/vehicles/:identifier/equipment`
- **Query Params**:
  - `startDate` *(optional, ISO date string)*
  - `endDate` *(optional, ISO date string)*
  - `page` *(optional, number, default: 1)*
  - `limit` *(optional, number, default: 50)*
- **Response**: `200 OK` $\rightarrow$ `VehicleEquipmentResponseDTO[]`

#### `POST /api/vehicles/:identifier/equipment`
- **Body**: `VehicleEquipmentCreateDTO`
- **Response**: `201 Created` $\rightarrow$ `VehicleEquipmentResponseDTO`

#### `GET /api/vehicles/:identifier/equipment/:itemId`
- **Response**: `200 OK` $\rightarrow$ `VehicleEquipmentResponseDTO`

#### `PATCH /api/vehicles/:identifier/equipment/:itemId`
- **Body**: `VehicleEquipmentUpdateDTO`
- **Response**: `200 OK` $\rightarrow$ `VehicleEquipmentResponseDTO`

#### `DELETE /api/vehicles/:identifier/equipment/:itemId`
- **Response**: `204 No Content`

---

### 3.5. Cross-Domain Spending Linking

#### `POST /api/vehicles/spendings/link`
Links one or more vehicle spending entries (across fuel, equipment, maintenance) to a single finance transaction.
- **Body**: `LinkSpendingsToTransactionDTO`
  ```json
  {
    "transactionId": "6ac5758a246a9e13ff176f4f",
    "spendings": [
      { "spendingType": "fuel", "spendingId": "6ac5758a246a9e13ff176f52" },
      { "spendingType": "maintenance", "spendingId": "6ac5758a246a9e13ff176f55" }
    ]
  }
  ```
- **Response**: `200 OK` $\rightarrow$ `{ "acknowledged": true, "modifiedCount": 2 }`
- **Errors**:
  - `404 Not Found` (`TRANSACTION_NOT_FOUND_ERROR` or `VEHICLE_SPENDING_NOT_FOUND_ERROR`)

#### `POST /api/vehicles/spendings/unlink`
Clears the `transactionId` reference from a vehicle spending document.
- **Body**: `UnlinkSpendingFromTransactionDTO`
  ```json
  {
    "spendingType": "fuel",
    "spendingId": "6ac5758a246a9e13ff176f52"
  }
  ```
- **Response**: `200 OK` $\rightarrow$ `{ "acknowledged": true, "modifiedCount": 1 }`

---

## 4. Error Codes Reference

All error responses return standard API error format:
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Vehicle with id or slug 'suzuki-sv-650' not found",
  "code": "VEHICLE_NOT_FOUND_ERROR"
}
```

| HTTP Status | Error `code` | Description |
|---|---|---|
| `400 Bad Request` | `VALIDATION_ERROR` / `FST_ERR_VALIDATION` | Invalid payload or malformed ObjectId |
| `400 Bad Request` | `VEHICLE_ODOMETER_SEQUENCE_ERROR` | Odometer violates chronology vs adjacent refuels |
| `401 Unauthorized`| `UNAUTHORIZED_MISSING_TOKEN_ERROR` / `UNAUTHORIZED_INVALID_TOKEN_ERROR` | Missing or invalid auth header |
| `403 Forbidden`   | `VEHICLE_DEPENDENCY_ERROR` | Cannot delete vehicle because child logs exist |
| `404 Not Found`   | `VEHICLE_NOT_FOUND_ERROR` | Vehicle `_id` or `slug` not found for user |
| `404 Not Found`   | `VEHICLE_FUEL_ENTRY_NOT_FOUND_ERROR` | Fuel log entry ID not found |
| `404 Not Found`   | `VEHICLE_MAINTENANCE_NOT_FOUND_ERROR` | Maintenance record ID not found |
| `404 Not Found`   | `VEHICLE_EQUIPMENT_NOT_FOUND_ERROR` | Equipment item ID not found |
| `404 Not Found`   | `VEHICLE_SPENDING_NOT_FOUND_ERROR` | Target spending ID not found |
| `404 Not Found`   | `TRANSACTION_NOT_FOUND_ERROR` | Target finance transaction not found |
| `409 Conflict`    | `VEHICLE_NAME_ALREADY_EXISTS_ERROR` | Vehicle name duplicate for user |
| `409 Conflict`    | `VEHICLE_SLUG_ALREADY_EXISTS_ERROR` | Derived slug duplicate for user |
