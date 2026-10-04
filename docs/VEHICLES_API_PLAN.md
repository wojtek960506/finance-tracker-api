# Vehicles-Domain API Implementation Plan

## Overview
This document outlines the step-by-step plan for implementing the **Vehicles domain** in `finance-tracker-api`. It is aligned directly with the architectural patterns, libraries, and design conventions used across this repository (such as the `investments`, `transactions`, and `named-resources` domains).

```
Repository Root:
/home/wojtek960506/Programming/own_projects/finance-tracker/finance-tracker-api
```

### Core Goals & Scope
1. **Vehicle Resources** – Store vehicle metadata (`name`, `brand`, `model`, `type`, `productionYear`, `notes`) scoped to the authenticated user (`ownerId`).
2. **Domain Collections** – Persist raw granular records across 3 core spending/usage domains:
   - **Fuel Entries** (`fuel_entries.csv`) – individual fill-ups with raw input data (date, fuel liters, tank status, unit price, cost, odometer, station).
   - **Equipment** (`vehicle_equipment.csv`) – accessories, parts, and equipment purchases.
   - **Maintenance** (`own_maintenance.csv`, `previous_owner_services.csv`, `driving_licence_costs.csv`) – section-based service & administrative costs.
   > **Note on Derived Fuel Metrics & Statistics**:
   > In the legacy spreadsheets, many fuel columns (e.g. `distance_since_previous_km`, `consumption_l_per_100km`, `fuel_liters_to_full`, `cost_per_km_pln`) and aggregated tables (`fuel_stats.csv`, `fuel_yearly_distance_summary.csv`) were calculated from consecutive raw records.
   > To keep the database normalized, maintainable, and resilient to edits/inserts in past dates without requiring cascade database updates, **the database stores only raw user inputs**. All delta distances, consumption rates, and statistics are calculated **dynamically on-the-fly** by domain calculation helpers when requested.
3. **Transaction Linking (1:N)** – Vehicle spendings (Fuel Entries, Equipment, Maintenance) optionally reference a `transactionId` (foreign key to `Transaction`). One financial transaction can be linked to multiple vehicle spending records (e.g. single receipt covering multiple services/items).
4. **Idempotent Imports** – Data rows track `sourceRow` (1-based index from CSV), ensuring imports can be safely re-run without creating duplicates.
5. **Full Multi-Tenancy** – Every record is strictly scoped by `ownerId` (JWT Bearer authentication).

---

## 1️⃣ Tech Stack Alignment

| Component | Repository Choice | Notes |
|-----------|-------------------|-------|
| **Runtime & Language** | Node.js (ESM) + TypeScript | Configured in `tsconfig.json` with strict mode |
| **Web Framework** | Fastify v5 | Using `fastify-type-provider-zod` + `fastify-zod-openapi` |
| **Database & ODM** | MongoDB with Mongoose v8 | Document models, typed interfaces, compound indexes |
| **Validation & DTOs** | Zod v4 (`zod/v4`) | Registered via `z.globalRegistry.add(Schema, { id })` for OpenAPI docs |
| **Authentication** | Fastify JWT (`@fastify/jwt`) | Bearer token via `authorizeAccessToken()` pre-handler |
| **Testing** | Vitest + Supertest | Unit & route tests in `src/vehicles/**/*.test.ts` |
| **OpenAPI Export** | `@fastify/swagger` + `@fastify/swagger-ui` | Run `pnpm openapi:export` to update `openapi.json` |

---

## 2️⃣ Directory Structure

Following the established structure of `@investment` and `@transaction`:

```
src/vehicles/
├── consts.ts                         # Enums, kinds, sort options, section names
├── types.ts                          # Core TypeScript interfaces & DB attributes
├── index.ts                          # Public exports
├── model/                            # Mongoose schemas & models
│   ├── vehicle-model.ts
│   ├── vehicle-fuel-entry-model.ts
│   ├── vehicle-equipment-model.ts
│   ├── vehicle-maintenance-model.ts
│   └── index.ts
├── schema/                           # Zod schemas (DTOs, params, queries, responses)
│   ├── vehicle-schema.ts
│   ├── vehicle-fuel-schema.ts
│   ├── vehicle-equipment-schema.ts
│   ├── vehicle-maintenance-schema.ts
│   ├── vehicle-spending-link-schema.ts
│   └── index.ts
├── serializers/                      # Document -> API response mappers
│   ├── vehicle-serializer.ts
│   ├── vehicle-fuel-serializer.ts
│   ├── vehicle-equipment-serializer.ts
│   ├── vehicle-maintenance-serializer.ts
│   └── index.ts
├── services/                         # Business logic & DB queries
│   ├── vehicles/                     # Vehicle CRUD
│   ├── fuel/                         # Fuel entries queries & dynamic metric calculation
│   ├── equipment/                    # Equipment queries
│   ├── maintenance/                  # Maintenance queries
│   ├── spendings/                    # Linking / unlinking transactions
│   ├── importer/                     # Batch / idempotent CSV import service
│   └── index.ts
└── routes/                           # Fastify route plugins & handlers
    ├── vehicle-routes.ts             # Master plugin registered at /api/vehicles
    ├── vehicle-crud-routes.ts        # /api/vehicles (CRUD)
    ├── vehicle-fuel-routes.ts        # /api/vehicles/:vehicleId/fuel/*
    ├── vehicle-equipment-routes.ts   # /api/vehicles/:vehicleId/equipment/*
    ├── vehicle-maintenance-routes.ts # /api/vehicles/:vehicleId/maintenance/*
    ├── vehicle-spendings-routes.ts   # /api/vehicles/:vehicleId/spendings/*
    ├── handlers/                     # Route handler functions
    └── index.ts
```

Path aliases in `tsconfig.json`:
```json
{
  "paths": {
    "@vehicles": ["vehicles/index.ts"],
    "@vehicles/*": ["vehicles/*"]
  }
}
```

---

## 3️⃣ Persistent Data Model (Mongoose)

### 1. `Vehicle`
Represents an individual vehicle owned by a user.

```typescript
// src/vehicles/model/vehicle-model.ts
export interface IVehicle extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;        // ref: 'User'
  slug: string;                   // unique slug per owner (e.g., 'suzuki-sv-650')
  name: string;                   // full display name (e.g., 'Suzuki SV650')
  brand?: string;                 // e.g., 'Suzuki' (optional / future split)
  model?: string;                 // e.g., 'SV650' (optional / future split)
  type: 'motorcycle' | 'car' | 'public_transport';
  productionYear?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ ownerId: 1, slug: 1 }` (unique)
- `{ ownerId: 1, name: 1 }`

---

### 2. `VehicleFuelEntry` (Raw Granular Model)
Stores the raw user-specified refueling events.

#### Field Classification

| Field Type | Field Name | Description |
|---|---|---|
| **Raw Inputs (Stored in DB)** | `date` | Refueling timestamp |
| | `fuelLiters` | Liters of fuel pumped |
| | `isFullTank` | Boolean indicating whether filled to full tank |
| | `unitPricePln` | Price per liter in PLN |
| | `costPln` | Total cost in PLN for the fill-up |
| | `odometerKm` | Current vehicle odometer reading in km |
| | `stationBrand` | Gas station brand (e.g. Orlen, BP, Shell) |
| | `stationAddress` | Station location / address |
| | `description` | Optional notes |
| | `transactionId` | Optional FK linking to financial `Transaction` |
| | `sourceRow` | 1-based CSV row number (for idempotent import) |
| **Derived Metrics (Computed Dynamically)** | `fuelLitersToFull` | Total liters accumulated between previous and current full tank |
| | `costToFullPln` | Total cost accumulated between previous and current full tank |
| | `distanceSincePreviousKm` | `odometerKm - previous.odometerKm` |
| | `distanceSincePreviousFullKm` | `odometerKm - previousFullTank.odometerKm` |
| | `consumptionLPer100Km` | `(fuelLitersToFull / distanceSincePreviousFullKm) * 100` |
| | `costPerKmPln` | `costToFullPln / distanceSincePreviousFullKm` |
| | `kmPerLiter` | `distanceSincePreviousFullKm / fuelLitersToFull` |

```typescript
// src/vehicles/model/vehicle-fuel-entry-model.ts
export interface IVehicleFuelEntry extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;                        // ref: 'User'
  vehicleId: Types.ObjectId;                      // ref: 'Vehicle'
  sourceRow?: number;                             // 1-based data row index from CSV
  date: Date;
  fuelLiters: number;
  isFullTank: boolean;
  unitPricePln: number;
  costPln: number;
  odometerKm: number;
  stationBrand?: string;
  stationAddress?: string;
  description?: string;
  transactionId?: Types.ObjectId | null;          // ref: 'Transaction'
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ ownerId: 1, vehicleId: 1, sourceRow: 1 }` (unique, sparse when sourceRow present)
- `{ ownerId: 1, vehicleId: 1, date: -1, odometerKm: -1 }`
- `{ ownerId: 1, transactionId: 1 }` (sparse index for transaction lookups)

---

### 3. `VehicleEquipment`
Purchases of parts, accessories, and gear for the vehicle.

```typescript
// src/vehicles/model/vehicle-equipment-model.ts
export interface IVehicleEquipment extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;                        // ref: 'User'
  vehicleId: Types.ObjectId;                      // ref: 'Vehicle'
  sourceRow?: number;
  date: Date;
  itemName: string;
  costPln: number;
  description?: string;
  transactionId?: Types.ObjectId | null;          // ref: 'Transaction'
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ ownerId: 1, vehicleId: 1, sourceRow: 1 }` (unique, sparse)
- `{ ownerId: 1, vehicleId: 1, date: -1 }`
- `{ ownerId: 1, transactionId: 1 }` (sparse)

---

### 4. `VehicleMaintenance`
Service records, maintenance actions, previous owner history, and licensing fees.

```typescript
// src/vehicles/model/vehicle-maintenance-model.ts
export type MaintenanceSection = 
  | 'own_maintenance' 
  | 'previous_owner_services' 
  | 'driving_licence_costs';

export interface IVehicleMaintenance extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;                        // ref: 'User'
  vehicleId: Types.ObjectId;                      // ref: 'Vehicle'
  sourceRow?: number;
  section: MaintenanceSection;
  date: Date;
  costPln: number;
  odometerKm?: number;
  description?: string;
  serviceProvider?: string;
  transactionId?: Types.ObjectId | null;          // ref: 'Transaction'
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ ownerId: 1, vehicleId: 1, section: 1, sourceRow: 1 }` (unique, sparse)
- `{ ownerId: 1, vehicleId: 1, section: 1, date: -1 }`
- `{ ownerId: 1, transactionId: 1 }` (sparse)

---

## 4️⃣ Zod Schema & Validation Layer

All schemas reside under `src/vehicles/schema/` and follow the `zod/v4` patterns used throughout the project:

### Vehicle Schemas
- `VehicleTypeSchema`: `z.enum(['motorcycle', 'car', 'public_transport'])`
- `VehicleCreateSchema`: Body schema for creating a vehicle (`slug`, `name`, `brand`, `model`, `type`, `productionYear`, `notes`).
- `VehicleUpdateSchema`: `VehicleCreateSchema.partial()`
- `VehicleResponseSchema`: Extends `VehicleCreateSchema` with `id`, `ownerId`, `createdAt`, `updatedAt`.
- `VehicleListResponseSchema`: `z.array(VehicleResponseSchema)`

### Fuel Entry Schemas
- `VehicleFuelEntryCreateSchema`:
```typescript
export const VehicleFuelEntryCreateSchema = z.object({
  date: z.coerce.date(),
  fuelLiters: z.number().positive(),
  isFullTank: z.boolean(),
  unitPricePln: z.number().positive(),
  costPln: z.number().positive(),
  odometerKm: z.number().int().nonnegative(),
  stationBrand: z.string().max(100).optional(),
  stationAddress: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  transactionId: z.string().regex(OBJECT_ID_REGEX).nullable().optional(),
});
```
- `VehicleFuelEntryResponseSchema`: Basic raw document response.
- `VehicleFuelEntryEnrichedResponseSchema`: Enriched response extending raw response with derived metrics (`fuelLitersToFull`, `costToFullPln`, `distanceSincePreviousKm`, `distanceSincePreviousFullKm`, `consumptionLPer100Km`, `costPerKmPln`, `kmPerLiter`).

### Spending & Filter Query Schemas
- `VehiclePaginationQuerySchema`: Standard pagination (`page` min 1 default 1, `limit` min 1 max 100 default 50).
- `VehicleDateFilterQuerySchema`: `VehiclePaginationQuerySchema.extend({ startDate: z.coerce.date().optional(), endDate: z.coerce.date().optional() })`
- `VehicleFuelFilterQuerySchema`: `VehicleDateFilterQuerySchema.extend({ isFullTank: z.coerce.boolean().optional(), enriched: z.coerce.boolean().optional().default(true) })`
- `VehicleMaintenanceFilterQuerySchema`: `VehicleDateFilterQuerySchema.extend({ section: MaintenanceSectionSchema.optional() })`

### Transaction Linking Schemas
- `LinkSpendingsToTransactionSchema`:
```typescript
export const LinkSpendingsToTransactionSchema = z.object({
  transactionId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `transactionId`'),
  spendings: z.array(
    z.object({
      spendingType: z.enum(['fuel', 'equipment', 'maintenance']),
      spendingId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `spendingId`'),
    })
  ).min(1, 'At least one spending item must be specified'),
});
```
- `UnlinkSpendingFromTransactionSchema`:
```typescript
export const UnlinkSpendingFromTransactionSchema = z.object({
  spendingType: z.enum(['fuel', 'equipment', 'maintenance']),
  spendingId: z.string().regex(OBJECT_ID_REGEX, 'Invalid ObjectId format for `spendingId`'),
});
```

All schemas registered in OpenAPI registry:
```typescript
z.globalRegistry.add(VehicleResponseSchema, { id: 'VehicleResponse' });
z.globalRegistry.add(VehicleFuelEntryResponseSchema, { id: 'VehicleFuelEntryResponse' });
z.globalRegistry.add(VehicleFuelEntryEnrichedResponseSchema, { id: 'VehicleFuelEntryEnrichedResponse' });
z.globalRegistry.add(VehicleEquipmentResponseSchema, { id: 'VehicleEquipmentResponse' });
z.globalRegistry.add(VehicleMaintenanceResponseSchema, { id: 'VehicleMaintenanceResponse' });
```

---

## 5️⃣ Service Layer & Business Logic

### 1. `VehicleService` (`src/vehicles/services/vehicles/`)
- `createVehicle(ownerId, dto)` – Validates slug uniqueness for user; creates `Vehicle`.
- `getVehicles(ownerId, query)` – Retrieves user's vehicles.
- `getVehicleById(ownerId, vehicleId)` – Returns vehicle or throws `VehicleNotFoundError`.
- `getVehicleBySlug(ownerId, slug)` – Slug lookup.
- `updateVehicle(ownerId, vehicleId, dto)` – Updates metadata.
- `deleteVehicle(ownerId, vehicleId)` – Deletes vehicle and safely cascades or blocks if child records exist.

### 2. `VehicleFuelService` (`src/vehicles/services/fuel/`)
- `getFuelEntries(ownerId, vehicleId, query)` – Retrieves fuel entries with optional dynamic enrichment (`enrichFuelEntries`).
- `getFuelEntryById(ownerId, vehicleId, entryId)` – Single entry lookup.
- `createFuelEntry(ownerId, vehicleId, dto)` – Creates a raw fuel entry record.
- `enrichFuelEntries(entries)` – Pure function that iterates sorted entries (by date/odometer) and computes:
  - `distanceSincePreviousKm`: delta between consecutive readings.
  - Full-tank buckets: aggregates `fuelLiters` and `costPln` across partial fill-ups up to each full tank.
  - Fuel consumption (`L/100km`) and cost efficiency (`PLN/km`, `km/L`).

### 3. `VehicleEquipmentService` (`src/vehicles/services/equipment/`)
- `getEquipment(ownerId, vehicleId, query)` – Paginated equipment list.
- `getEquipmentById(ownerId, vehicleId, equipmentId)` – Single item.
- `createEquipment(ownerId, vehicleId, dto)` – Create equipment record.

### 4. `VehicleMaintenanceService` (`src/vehicles/services/maintenance/`)
- `getMaintenance(ownerId, vehicleId, query)` – Section-filtered maintenance list.
- `getMaintenanceById(ownerId, vehicleId, maintenanceId)` – Single record.
- `createMaintenance(ownerId, vehicleId, dto)` – Create maintenance record.

### 5. `VehicleSpendingLinkService` (`src/vehicles/services/spendings/`)
- `linkSpendingsToTransaction(ownerId, vehicleId, dto)`:
  1. Validates that `transactionId` exists and belongs to `ownerId` (queries `TransactionModel`).
  2. For each spending in `dto.spendings`, verifies ownership and updates `transactionId`.
  3. Returns summary of linked items (`{ modifiedCount: number }`).
- `unlinkSpending(ownerId, vehicleId, dto)`:
  1. Sets `transactionId: null` for the target spending item.

### 6. `VehicleBatchImporterService` (`src/vehicles/services/importer/`)
- `importVehicleData(ownerId, vehicleSlug, payload)`:
  - Finds or creates the `Vehicle` entity.
  - Performs bulk `bulkWrite` upserts for raw `fuelEntries`, `equipment`, and `maintenance` matched on `(ownerId, vehicleId, sourceRow)`.
  - Guarantees complete idempotency for re-running imports.

---

## 6️⃣ API Routes & Contract

All routes are registered under the `/api/vehicles` prefix in `src/app/app.ts`.

### Endpoints Overview

| Method | Route | Description |
|---|---|---|
| **Vehicles CRUD** | | |
| `POST` | `/api/vehicles` | Create a new vehicle |
| `GET` | `/api/vehicles` | List all vehicles for current user |
| `GET` | `/api/vehicles/:vehicleId` | Get vehicle details by ID |
| `PATCH` | `/api/vehicles/:vehicleId` | Update vehicle details |
| `DELETE` | `/api/vehicles/:vehicleId` | Delete vehicle |
| **Fuel Domain** | | |
| `POST` | `/api/vehicles/:vehicleId/fuel/entries` | Create a fuel entry record |
| `GET` | `/api/vehicles/:vehicleId/fuel/entries` | List fuel entries (query: `startDate`, `endDate`, `isFullTank`, `enriched`, `page`, `limit`) |
| `GET` | `/api/vehicles/:vehicleId/fuel/entries/:id` | Get specific fuel entry by ID |
| `DELETE` | `/api/vehicles/:vehicleId/fuel/entries/:id` | Delete a fuel entry |
| **Equipment Domain** | | |
| `POST` | `/api/vehicles/:vehicleId/equipment` | Create equipment purchase record |
| `GET` | `/api/vehicles/:vehicleId/equipment` | List paginated equipment items |
| `GET` | `/api/vehicles/:vehicleId/equipment/:id` | Get specific equipment item |
| `DELETE` | `/api/vehicles/:vehicleId/equipment/:id` | Delete an equipment item |
| **Maintenance Domain** | | |
| `POST` | `/api/vehicles/:vehicleId/maintenance` | Create maintenance entry |
| `GET` | `/api/vehicles/:vehicleId/maintenance` | List paginated maintenance entries (query: `section`, `startDate`, `endDate`) |
| `GET` | `/api/vehicles/:vehicleId/maintenance/:id` | Get specific maintenance entry |
| `DELETE` | `/api/vehicles/:vehicleId/maintenance/:id` | Delete maintenance entry |
| **Spending Links** | | |
| `POST` | `/api/vehicles/:vehicleId/spendings/link` | Link one or many vehicle spendings to an existing `transactionId` |
| `POST` | `/api/vehicles/:vehicleId/spendings/unlink` | Unlink a spending item from its transaction |
| **Data Import** | | |
| `POST` | `/api/vehicles/:vehicleId/import` | Idempotent bulk import of parsed CSV data |

---

## 7️⃣ Domain Errors

Create `src/utils/errors/vehicle-errors.ts` extending `AppError`:

```typescript
import { AppError } from './general-errors';

export class VehicleNotFoundError extends AppError {
  readonly code = 'VEHICLE_NOT_FOUND_ERROR';
  constructor(identifier: string) {
    super(404, `Vehicle with id or slug '${identifier}' not found`);
  }
}

export class VehicleAlreadyExistsError extends AppError {
  readonly code = 'VEHICLE_ALREADY_EXISTS_ERROR';
  constructor(slug: string) {
    super(409, `Vehicle with slug '${slug}' already exists`);
  }
}

export class VehicleSpendingNotFoundError extends AppError {
  readonly code = 'VEHICLE_SPENDING_NOT_FOUND_ERROR';
  constructor(spendingType: string, spendingId: string) {
    super(404, `${spendingType} spending entry with id '${spendingId}' not found`);
  }
}
```

Registered with the centralized Fastify error handler (`src/app/plugins/errorHandler.ts`).

---

## 8️⃣ Testing Strategy

All tests execute with `vitest` under `src/vehicles/`:

1. **Schema & Serializer Tests**:
   - `src/vehicles/schema/*.test.ts`: Validate Zod rules (types, pagination limits, ObjectId formats, required fields).
   - `src/vehicles/serializers/*.test.ts`: Validate Document-to-DTO transformations.
2. **Service Unit Tests**:
   - `src/vehicles/services/**/*.test.ts`: Verify CRUD, idempotent upserts, transaction linking constraints, dynamic fuel calculations, error handling.
3. **Route Integration Tests**:
   - `src/vehicles/routes/*.test.ts`: Use `buildApp({ skipDbSetup: true })` + `supertest` with MongoDB in-memory or integration DB to test full HTTP request-response lifecycle with JWT authorization.

---

## 9️⃣ Implementation Roadmap

### Phase 1: Foundation & Models
- [ ] Define constants, enums, and types in `src/vehicles/consts.ts` and `src/vehicles/types.ts`.
- [ ] Create Mongoose schemas and models in `src/vehicles/model/` (`Vehicle`, `VehicleFuelEntry`, `VehicleEquipment`, `VehicleMaintenance`) with compound indexes.
- [ ] Add `@vehicles` alias in `tsconfig.json`.

### Phase 2: Schemas & Serializers
- [ ] Implement Zod schemas in `src/vehicles/schema/` with OpenAPI registration.
- [ ] Implement serializers in `src/vehicles/serializers/`.
- [ ] Add domain error classes in `src/utils/errors/vehicle-errors.ts`.

### Phase 3: Services & Business Logic
- [ ] Implement Vehicle CRUD service.
- [ ] Implement pure calculation helper for dynamic fuel metrics (`enrichFuelEntries`).
- [ ] Implement query services for Fuel, Equipment, and Maintenance.
- [ ] Implement Spending Link & Unlink service (with Transaction validation).
- [ ] Implement Idempotent Batch Importer service.

### Phase 4: Route Handlers & Server Integration
- [ ] Implement Fastify routes and handlers under `src/vehicles/routes/`.
- [ ] Register `vehicleRoutes` in `src/app/app.ts` (`/api/vehicles`).
- [ ] Run `pnpm openapi:export` to update `openapi.json`.

### Phase 5: Verification & Testing
- [ ] Write unit tests for schemas, dynamic calculations, and services.
- [ ] Write integration route tests with `supertest`.
- [ ] Run `pnpm test:coverage`, `pnpm lint`, and `pnpm format`.

### Future Enhancements (Post-MVP)
- [ ] Dynamic Fuel Statistics calculation module (computing overall and yearly metrics on-the-fly from fuel entries).
- [ ] Yearly Distance Summary calculation module.
