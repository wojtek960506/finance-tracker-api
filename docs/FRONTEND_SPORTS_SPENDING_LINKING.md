# Frontend Integration Guide: Sports Spending Linking & Unlinking

This document outlines the API contracts, TypeScript definitions, and React Query
patterns for the newly introduced **Sports Spending Linking** endpoints in `finance-tracker-api`.

These endpoints mirror the linking mechanisms established in the **Vehicles domain**,
enabling users to link one or multiple sport entries to a financial transaction
or unlink them when needed.

---

## 1. Overview of Endpoints

| Endpoint | Method | Purpose | Batch Support |
| :--- | :---: | :--- | :---: |
| `/api/sports/spendings/link` | `POST` | Link sport entries to a financial transaction | ✅ Yes (`entryIds: string[]`) |
| `/api/sports/spendings/unlink` | `POST` | Disconnect a sport entry from transaction | ❌ Single (`entryId: string`) |

---

## 2. API Contract Specifications

### A. Link Sport Spendings to Transaction

Links an array of sport entries to a single financial transaction. Validates that
both the target transaction and all target sport entries exist and belong to the
authenticated user.

- **URL**: `/api/sports/spendings/link`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "transactionId": "67116b43e18a0029b31d8001",
    "entryIds": [
      "67116b43e18a0029b31d8002",
      "67116b43e18a0029b31d8003"
    ]
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "acknowledged": true,
    "modifiedCount": 2
  }
  ```
- **Error Codes**:
  - `400 Bad Request`: Validation failure (empty `entryIds`, non-hex 24-character IDs).
  - `401 Unauthorized`: Missing or invalid JWT.
  - `404 Not Found`:
    - `Transaction not found or access denied`
    - `One or more sport entries not found or access denied`

---

### B. Unlink Sport Spending from Transaction

Clears the `transactionId` field (`transactionId = null`) on a single sport entry.

- **URL**: `/api/sports/spendings/unlink`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "entryId": "67116b43e18a0029b31d8002"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "acknowledged": true,
    "modifiedCount": 1
  }
  ```
- **Error Codes**:
  - `400 Bad Request`: Invalid ObjectId format.
  - `401 Unauthorized`: Missing or invalid JWT.
  - `404 Not Found`: `Sport entry not found or access denied`.

---

## 3. TypeScript Interfaces

Add these interfaces to your frontend types (e.g. `src/features/sports/types.ts`):

```typescript
export interface LinkSportSpendingsToTransactionDTO {
  transactionId: string;
  entryIds: string[];
}

export interface UnlinkSportSpendingFromTransactionDTO {
  entryId: string;
}

export interface SportSpendingLinkResponseDTO {
  acknowledged: boolean;
  modifiedCount: number;
}
```

---

## 4. API Client & React Query Hooks

### API Service Methods (`src/features/sports/api/sports-spending-api.ts`)

```typescript
import { apiClient } from '@/shared/api/api-client';
import {
  LinkSportSpendingsToTransactionDTO,
  UnlinkSportSpendingFromTransactionDTO,
  SportSpendingLinkResponseDTO,
} from '../types';

export const linkSportSpendings = async (
  payload: LinkSportSpendingsToTransactionDTO,
): Promise<SportSpendingLinkResponseDTO> => {
  const { data } = await apiClient.post<SportSpendingLinkResponseDTO>(
    '/api/sports/spendings/link',
    payload,
  );
  return data;
};

export const unlinkSportSpending = async (
  payload: UnlinkSportSpendingFromTransactionDTO,
): Promise<SportSpendingLinkResponseDTO> => {
  const { data } = await apiClient.post<SportSpendingLinkResponseDTO>(
    '/api/sports/spendings/unlink',
    payload,
  );
  return data;
};
```

---

### React Query Mutations (`src/features/sports/hooks/use-sport-spending-mutations.ts`)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { linkSportSpendings, unlinkSportSpending } from '../api/sports-spending-api';
import { sportKeys } from '../api/query-keys';
import {
  LinkSportSpendingsToTransactionDTO,
  UnlinkSportSpendingFromTransactionDTO,
} from '../types';

export const useLinkSportSpendingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LinkSportSpendingsToTransactionDTO) =>
      linkSportSpendings(payload),
    onSuccess: () => {
      // Invalidate entries list to reflect updated transactionId
      queryClient.invalidateQueries({ queryKey: sportKeys.entries() });
    },
  });
};

export const useUnlinkSportSpendingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UnlinkSportSpendingFromTransactionDTO) =>
      unlinkSportSpending(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sportKeys.entries() });
      queryClient.invalidateQueries({
        queryKey: sportKeys.entryDetails(variables.entryId),
      });
    },
  });
};
```

---

## 5. UI & UX Recommendations

1. **Table Action Menu**:
   - For an unlinked entry (`transactionId === null`): provide a `"Link to Transaction"` action
     button opening a transaction selector dialog.
   - For a linked entry (`transactionId !== null`): display a clickable badge or link navigating
     to the transaction, alongside an `"Unlink from Transaction"` action.
2. **Batch Linking**:
   - In `SportEntriesTable`, allow multi-selection checkboxes.
   - When 1 or more rows are selected, render a bulk action bar:
     `"Link selected (${count}) to transaction"`.
3. **Optimistic Feedback**:
   - Show quick toast notifications (e.g. `"Sport spendings linked successfully"`
     or `"Sport spending unlinked"`).
