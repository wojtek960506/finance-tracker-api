# Frontend Integration Guide: Sports Domain

## Overview

The **Sports Domain** (`/api/sports`) allows users to log and manage sports-related expenditures, organize activities by customizable or system categories, link expenditures to financial transactions, and view detailed spending analytics and trend charts.

All endpoints require standard user authentication via Bearer Access Token in the `Authorization: Bearer <token>` header.

---

## 1. Resource Hierarchy & Endpoints

```
/api/sports
├── /                                         # List & Create sport entries
├── /:id                                      # Get, Update, Delete sport entry
├── /stats                                    # Aggregated analytics & chart metrics
├── /spendings
│   ├── /link                                 # Batch link sport entries to a transaction
│   └── /unlink                               # Unlink sport entry from transaction
└── /categories                               # Sport categories (polymorphic named resources)
    ├── /                                     # List & Create categories
    ├── /:id                                  # Get, Update, Delete category
    ├── /:id/favorite                         # Favorite category
    ├── /:id/unfavorite                       # Unfavorite category
    └── /favorites                            # List favorite categories
```

> **Routing Note**: Sport entry CRUD is mounted directly at the domain root `/api/sports` (not `/api/sports/entries`). Static sub-paths (`/categories`, `/stats`) are mounted with dedicated router plugins.

---

## 2. TypeScript Types & Contracts

```typescript
// ==========================================
// 1. Sport Categories (Named Resources)
// ==========================================

export type SportCategoryType = 'user' | 'system';

export interface SportCategoryDTO {
  id: string;
  name: string;
  nameNormalized: string;
  type: SportCategoryType;
  ownerId?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SportCategoryCreateDTO {
  name: string;
}

export interface SportCategoryUpdateDTO {
  name: string;
}

// Populated category nested within SportEntry
export interface PopulatedSportCategoryDTO {
  id: string;
  name: string;
  type: SportCategoryType;
}

// ==========================================
// 2. Sport Entries
// ==========================================

export type SportEntrySortOption =
  | 'date_desc'
  | 'date_asc'
  | 'cost_desc'
  | 'cost_asc';

export interface SportEntryCreateDTO {
  categoryId: string; // 24-character hex ObjectId
  date: string;       // ISO date string (e.g. "2024-05-08T00:00:00.000Z" or "2024-05-08")
  itemName: string;   // 1 to 200 characters, trimmed
  costPln: number;    // Non-negative float (PLN)
  description?: string | null;     // Optional, max 500 characters
  transactionId?: string | null;   // Optional ObjectId reference to financial transaction
}

export type SportEntryUpdateDTO = Partial<SportEntryCreateDTO>;

export interface SportEntryResponseDTO {
  id: string;
  ownerId: string;
  categoryId: string;
  category: PopulatedSportCategoryDTO;
  date: string;
  itemName: string;
  costPln: number;
  description: string | null;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SportEntryFilterQueryDTO {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: SportEntrySortOption; // Default: 'date_desc'
  page?: number;               // Default: 1
  limit?: number;              // Default: 50, max: 200
}

export interface SportEntryPaginationDTO {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SportEntryListResponseDTO {
  items: SportEntryResponseDTO[];
  pagination: SportEntryPaginationDTO;
}

// ==========================================
// 3. Statistics & Analytics
// ==========================================

export interface SportStatsQueryDTO {
  year?: number; // Optional filter (1970 - 2100)
}

export interface SportStatsCategoryDTO {
  categoryId: string;
  categoryName: string;
  categoryKey?: string | null; // e.g. "other" for system categories, null for user categories
  type: SportCategoryType;
  totalCostPln: number;
  entryCount: number;
  percentage: number;          // 0 to 100, rounded to 2 decimal places
}

export interface SportStatsYearDTO {
  year: number;
  totalCostPln: number;
  entryCount: number;
}

export interface SportStatsMonthDTO {
  year: number;
  month: number;               // 1 to 12
  totalCostPln: number;
  entryCount: number;
}

export interface SportStatsResponseDTO {
  totalCostPln: number;
  totalEntries: number;
  byCategory: SportStatsCategoryDTO[];
  byYear: SportStatsYearDTO[];
  byMonth?: SportStatsMonthDTO[];
}

// ==========================================
// 4. Spending Linking & Unlinking
// ==========================================

export interface LinkSportSpendingsToTransactionDTO {
  transactionId: string; // 24-character hex ObjectId
  entryIds: string[];    // Array of at least 1 sport entry ObjectId
}

export interface UnlinkSportSpendingFromTransactionDTO {
  entryId: string;       // 24-character hex ObjectId
}

export interface SportSpendingLinkResponseDTO {
  acknowledged: boolean;
  modifiedCount: number;
}
```

---

## 3. API Endpoints Reference

### A. Sport Entries (`/api/sports`)

#### 1. List Entries
- **Method & Path**: `GET /api/sports`
- **Query Parameters**:
  - `categoryId` *(string, optional)*: Filter by specific category ID.
  - `startDate` *(string, optional)*: ISO date string for range start (`date >= startDate`).
  - `endDate` *(string, optional)*: ISO date string for range end (`date <= endDate`).
  - `search` *(string, optional)*: Case-insensitive substring match in `itemName`.
  - `sort` *(enum, optional)*: `'date_desc'` (default), `'date_asc'`, `'cost_desc'`, `'cost_asc'`.
  - `page` *(number, optional)*: Page number (starts at 1).
  - `limit` *(number, optional)*: Items per page (default: 50, max: 200).
- **Status**: `200 OK`
- **Response Shape**: `SportEntryListResponseDTO`

#### 2. Create Entry
- **Method & Path**: `POST /api/sports`
- **Body**: `SportEntryCreateDTO`
- **Status**: `201 Created`
- **Response Shape**: `SportEntryResponseDTO`

#### 3. Get Entry by ID
- **Method & Path**: `GET /api/sports/:id`
- **Status**: `200 OK`
- **Response Shape**: `SportEntryResponseDTO`

#### 4. Update Entry
- **Method & Path**: `PATCH /api/sports/:id`
- **Body**: `SportEntryUpdateDTO`
- **Status**: `200 OK`
- **Response Shape**: `SportEntryResponseDTO`

#### 5. Delete Entry
- **Method & Path**: `DELETE /api/sports/:id`
- **Status**: `204 No Content`

---

### B. Sport Categories (`/api/sports/categories`)

Built on the polymorphic Named Resource architecture:
- **`GET /api/sports/categories`**: List all categories (system defaults + user-created).
- **`POST /api/sports/categories`**: Create a custom user category (`{ name: string }`).
- **`PATCH /api/sports/categories/:id`**: Update custom category name.
- **`DELETE /api/sports/categories/:id`**: Delete category (fails with `400 Conflict` if entries reference it).
- **`POST /api/sports/categories/:id/favorite`**: Mark category as favorite.
- **`DELETE /api/sports/categories/:id/favorite`**: Unfavorite category.
- **`GET /api/sports/categories/favorites`**: List favorite categories.

---

### C. Statistics & Analytics (`/api/sports/stats`)

- **Method & Path**: `GET /api/sports/stats`
- **Query Parameters**:
  - `year` *(number, optional)*: Filter stats to a specific calendar year (e.g. `?year=2024`).
- **Status**: `200 OK`
- **Response Example**:
```json
{
  "totalCostPln": 55965.29,
  "totalEntries": 606,
  "byCategory": [
    {
      "categoryId": "67116b43e18a0029b31d8001",
      "categoryName": "Rower / Narzędzia",
      "categoryKey": null,
      "type": "user",
      "totalCostPln": 22716.5,
      "entryCount": 278,
      "percentage": 40.59
    },
    {
      "categoryId": "67116b43e18a0029b31d8002",
      "categoryName": "Inne",
      "categoryKey": "other",
      "type": "system",
      "totalCostPln": 4120.0,
      "entryCount": 45,
      "percentage": 7.36
    }
  ],
  "byYear": [
    { "year": 2023, "totalCostPln": 18500.0, "entryCount": 210 },
    { "year": 2024, "totalCostPln": 24200.5, "entryCount": 255 }
  ],
  "byMonth": [
    { "year": 2024, "month": 1, "totalCostPln": 1250.0, "entryCount": 15 },
    { "year": 2024, "month": 2, "totalCostPln": 2100.0, "entryCount": 22 }
  ]
}
```

---

### D. Spending Linking & Unlinking (`/api/sports/spendings`)

Endpoints to link and unlink sport entries with financial transactions (analogous to vehicles spending linking).

#### 1. Link Entries to Transaction
- **Method & Path**: `POST /api/sports/spendings/link`
- **Body**: `LinkSportSpendingsToTransactionDTO`
  ```json
  {
    "transactionId": "67116b43e18a0029b31d8001",
    "entryIds": ["67116b43e18a0029b31d8002", "67116b43e18a0029b31d8003"]
  }
  ```
- **Status**: `200 OK`
- **Response Shape**: `SportSpendingLinkResponseDTO` (`{ "acknowledged": true, "modifiedCount": 2 }`)
- **Errors**:
  - `400 Bad Request`: Validation failure (empty `entryIds`, invalid ObjectId format).
  - `404 Not Found`: Transaction not found / doesn't belong to user, or one or more sport entries not found / don't belong to user.

#### 2. Unlink Entry from Transaction
- **Method & Path**: `POST /api/sports/spendings/unlink`
- **Body**: `UnlinkSportSpendingFromTransactionDTO`
  ```json
  {
    "entryId": "67116b43e18a0029b31d8002"
  }
  ```
- **Status**: `200 OK`
- **Response Shape**: `SportSpendingLinkResponseDTO` (`{ "acknowledged": true, "modifiedCount": 1 }`)
- **Errors**:
  - `400 Bad Request`: Invalid ObjectId.
  - `404 Not Found`: Sport entry not found or doesn't belong to user.

---

## 4. Internationalization & Category Resolution

The backend seeds one default system category (`otherCategory` / `Inne`). All user-created categories have `type: 'user'`.

When rendering category labels in the UI:
```typescript
export const getCategoryDisplayName = (
  category: { name: string; type: 'user' | 'system'; categoryKey?: string | null },
  t: (key: string) => string,
): string => {
  if (category.type === 'system' && category.categoryKey) {
    // Translates using common/sports dictionaries e.g. "sports.categories.otherCategory"
    return t(`sports.categories.${category.categoryKey}`);
  }
  return category.name;
};
```

---

## 5. React Query Keys & Cache Invalidation

Recommended Query Key factory pattern in `src/features/sports/api/query-keys.ts`:

```typescript
export const sportKeys = {
  all: ['sports'] as const,
  entries: () => [...sportKeys.all, 'entries'] as const,
  entryList: (filters: SportEntryFilterQueryDTO) =>
    [...sportKeys.entries(), 'list', filters] as const,
  entryDetails: (id: string) => [...sportKeys.entries(), 'detail', id] as const,
  categories: () => [...sportKeys.all, 'categories'] as const,
  stats: (year?: number) => [...sportKeys.all, 'stats', { year }] as const,
};
```

### Invalidation Matrix

| Mutation | Queries to Invalidate |
| :--- | :--- |
| `createSportEntry` | `sportKeys.entries()`, `sportKeys.stats()` |
| `updateSportEntry` | `sportKeys.entries()`, `sportKeys.entryDetails(id)`, `sportKeys.stats()` |
| `deleteSportEntry` | `sportKeys.entries()`, `sportKeys.stats()` |
| `createSportCategory` | `sportKeys.categories()` |
| `updateSportCategory` | `sportKeys.categories()`, `sportKeys.entries()`, `sportKeys.stats()` |
| `deleteSportCategory` | `sportKeys.categories()`, `sportKeys.entries()`, `sportKeys.stats()` |
| `linkSportSpendings` | `sportKeys.entries()` |
| `unlinkSportSpending` | `sportKeys.entries()`, `sportKeys.entryDetails(id)` |

---

## 6. Recommended Frontend Feature Modular Structure

In `finance-tracker-web-v2`, following the feature architecture (`src/features/sports/`):

```
src/features/sports/
├── api/
│   ├── query-keys.ts                     # Query key factories
│   ├── use-sport-entries-query.ts        # GET /api/sports hook
│   ├── use-sport-entry-mutations.ts      # Create, update, delete mutations
│   ├── use-sport-spending-mutations.ts   # Link & unlink spendings to transactions
│   ├── use-sport-categories-query.ts     # GET /api/sports/categories hook
│   ├── use-sport-category-mutations.ts   # Category CRUD mutations
│   └── use-sport-stats-query.ts          # GET /api/sports/stats hook
├── components/
│   ├── dashboard/
│   │   ├── SportsStatsCards.tsx          # Total spent, total entries, active categories
│   │   ├── SportsCategoryPieChart.tsx    # Category percentage breakdown
│   │   └── SportsTrendBarChart.tsx       # Yearly & monthly spending trends
│   ├── entries/
│   │   ├── SportEntriesTable.tsx         # Paginated, sortable entries table
│   │   ├── SportEntriesFilterBar.tsx     # Search, category select, date pickers
│   │   ├── SportEntryFormDialog.tsx      # Create & edit entry dialog
│   │   └── DeleteSportEntryDialog.tsx    # Delete confirmation modal
│   └── categories/
│       ├── SportCategorySelect.tsx       # Combobox / select for categories
│       └── ManageSportCategoriesDialog.tsx # Custom category manager
├── consts.ts                             # Sort options, default limit, colors
├── schemas.ts                            # Zod form validation schemas
├── types.ts                              # DTOs and local UI state interfaces
└── index.ts                              # Public feature API
```

---

## 7. Form Validation Schemas (Zod)

```typescript
import { z } from 'zod';

export const SportEntryFormSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  itemName: z.string().trim().min(1, 'Item name is required').max(200),
  costPln: z.coerce.number().positive('Cost must be greater than 0'),
  description: z.string().max(500).optional().nullable(),
  transactionId: z.string().optional().nullable(),
});

export type SportEntryFormValues = z.infer<typeof SportEntryFormSchema>;
```
