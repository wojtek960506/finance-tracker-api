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
   - **Fuel Entries** (`fuel_entries.csv`) – individual fill-ups, distance, fuel efficiency, costs, station info.
   - **Equipment** (`vehicle_equipment.csv`) – accessories, parts, and equipment purchases.
   - **Maintenance** (`own_maintenance.csv`, `previous_owner_services.csv`, `driving_licence_costs.csv`) – section-based service & administrative costs.
   > **Note on Statistics**: Aggregated CSVs (`fuel_stats.csv`, `fuel_yearly_distance_summary.csv`) are kept in legacy storage for reference, but are **not** stored as separate database collections. Because stats and yearly summaries are derived purely from fuel entries, a dedicated on-the-fly statistics / summary module will be introduced later as dynamic query endpoints.
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
│   ├── fuel/                         # Fuel entries queries
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

### 2. `VehicleFuelEntry`
Individual refuel records.

```typescript
// src/vehicles/model/vehicle-fuel-entry-model.ts
export interface IVehicleFuelEntry extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;                        // ref: 'User'
  vehicleId: Types.ObjectId;                      // ref: 'Vehicle'
  sourceRow: number;                              // 1-based data row index from CSV
  date: Date;
  fuelLiters: number;
  fuelLitersToFull?: number;
  unitPricePln?: number;
  isFullTank: boolean;
  costPln: number;
  costToFullPln?: number;
  odometerKm?: number;
  distanceSincePreviousKm?: number;
  distanceSincePreviousFullKm?: number;
  consumptionLPer100Km?: number;
  costPerKmPln?: number;
  kmPerLiter?: number;
  stationBrand?: string;
  stationAddress?: string;
  description?: string;
  transactionId?: Types.ObjectId | null;          // ref: 'Transaction'
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ ownerId: 1, vehicleId: 1, sourceRow: 1 }` (unique)
- `{ ownerId: 1, vehicleId: 1, date: -1 }`
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
  sourceRow: number;
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
- `{ ownerId: 1, vehicleId: 1, sourceRow: 1 }` (unique)
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
  sourceRow: number;
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
- `{ ownerId: 1, vehicleId: 1, section: 1, sourceRow: 1 }` (unique)
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

### Spending & Fuel Query Schemas
- `VehiclePaginationQuerySchema`: Standard pagination (`page` min 1 default 1, `limit` min 1 max 100 default 50).
- `VehicleDateFilterQuerySchema`: `VehiclePaginationQuerySchema.extend({ startDate: z.coerce.date().optional(), endDate: z.coerce.date().optional() })`
- `VehicleFuelFilterQuerySchema`: `VehicleDateFilterQuerySchema.extend({ isFullTank: z.coerce.boolean().optional() })`
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
- `getFuelEntries(ownerId, vehicleId, query)` – Paginated, date-filtered fuel entries list.
- `getFuelEntryById(ownerId, vehicleId, entryId)` – Single entry lookup.

### 3. `VehicleEquipmentService` (`src/vehicles/services/equipment/`)
- `getEquipment(ownerId, vehicleId, query)` – Paginated equipment list.
- `getEquipmentById(ownerId, vehicleId, equipmentId)` – Single item.

### 4. `VehicleMaintenanceService` (`src/vehicles/services/maintenance/`)
- `getMaintenance(ownerId, vehicleId, query)` – Section-filtered maintenance list.
- `getMaintenanceById(ownerId, vehicleId, maintenanceId)` – Single record.

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
  - Performs bulk `bulkWrite` upserts for `fuelEntries`, `equipment`, and `maintenance` matched on `(ownerId, vehicleId, sourceRow)`.
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
| `GET` | `/api/vehicles/:vehicleId/fuel/entries` | List paginated fuel entries (filters: `startDate`, `endDate`, `isFullTank`, `page`, `limit`) |
| `GET` | `/api/vehicles/:vehicleId/fuel/entries/:id` | Get specific fuel entry by ID |
| **Equipment Domain** | | |
| `GET` | `/api/vehicles/:vehicleId/equipment` | List paginated equipment items |
| `GET` | `/api/vehicles/:vehicleId/equipment/:id` | Get specific equipment item |
| **Maintenance Domain** | | |
| `GET` | `/api/vehicles/:vehicleId/maintenance` | List paginated maintenance entries (query: `section`, `startDate`, `endDate`) |
| `GET` | `/api/vehicles/:vehicleId/maintenance/:id` | Get specific maintenance entry |
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
   - `src/vehicles/services/**/*.test.ts`: Verify CRUD, idempotent upserts, transaction linking constraints, error handling.
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
- [ ] Implement query services for Fuel, Equipment, and Maintenance.
- [ ] Implement Spending Link & Unlink service (with Transaction validation).
- [ ] Implement Idempotent Batch Importer service.

### Phase 4: Route Handlers & Server Integration
- [ ] Implement Fastify routes and handlers under `src/vehicles/routes/`.
- [ ] Register `vehicleRoutes` in `src/app/app.ts` (`/api/vehicles`).
- [ ] Run `pnpm openapi:export` to update `openapi.json`.

### Phase 5: Verification & Testing
- [ ] Write unit tests for schemas and services.
- [ ] Write integration route tests with `supertest`.
- [ ] Run `pnpm test:coverage`, `pnpm lint`, and `pnpm format`.

### Future Enhancements (Post-MVP)
- [ ] Build dynamic Fuel Statistics calculation module (computing overall and yearly metrics on-the-fly from fuel entries).
- [ ] Build Yearly Distance Summary calculation module.
