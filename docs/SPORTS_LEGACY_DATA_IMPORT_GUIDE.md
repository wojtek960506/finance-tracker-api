# Sports Legacy Data Import Guide

Comprehensive guide for parsing legacy sports spreadsheet data and importing
it into MongoDB for the **finance-tracker-api** sports domain.

---

## 1. Source Data Input

The legacy sports parser extracts multi-tab and multi-section sports spreadsheets
into a single consolidated CSV file:

- **Path**: `data/sports/parse/sports_entries.csv`
- **Columns**: `date,category,item_name,cost_pln`
- **Encoding**: `UTF-8`

### Sample Rows

```csv
date,category,item_name,cost_pln
2016-10-09,Wspinaczka,Opłata za semestr zajęć na OSIR OCHOTA (PW) CZWARTEK 8.00,200.00
2017-02-03,Wspinaczka,Pojedyncze wejście na ściankę gdzieś w Warszawie,19.00
2017-04-24,Rower / Narzędzia,Rower ostre koło,500.00
2018-05-10,Rower / Narzędzia,Rower Specialized Rockhopper Comp,1800.00
2020-01-15,Bieganie / Siłownia,Karnet na siłownię Zdrofit,120.00
```

---

## 2. MongoDB Target Collections & Schemas

### A. Collection: `sportcategories` (Sport Categories)

Each distinct category string from the CSV is resolved against the dedicated
`sportcategories` collection (polymorphic Named Resource kind `'sportCategory'`):

1. **System Default Category**:
   - `Inne` is seeded as:
     ```json
     {
       "_id": ObjectId("..."),
       "type": "system",
       "name": "Inne",
       "nameNormalized": "inne"
     }
     ```
2. **User Custom Categories**:
   - For any other category (e.g. `Wspinaczka`, `Rower / Narzędzia`), reuse the
     user's existing category or create a new user category document:
     ```json
     {
       "_id": ObjectId("..."),
       "ownerId": ObjectId("<USER_ID>"),
       "type": "user",
       "name": "Rower / Narzędzia",
       "nameNormalized": "rower / narzędzia",
       "createdAt": ISODate("2026-10-17T22:00:00.000Z"),
       "updatedAt": ISODate("2026-10-17T22:00:00.000Z")
     }
     ```

### B. Collection: `sportentries`

Each CSV row is stored as a document in the `sportentries` collection:

```json
{
  "_id": ObjectId("..."),
  "ownerId": ObjectId("<USER_ID>"),
  "categoryId": ObjectId("<CATEGORY_ID>"),
  "date": ISODate("2017-04-24T00:00:00.000Z"),
  "itemName": "Rower ostre koło",
  "costPln": 500.0,
  "description": null,
  "transactionId": null,
  "createdAt": ISODate("2026-10-17T22:00:00.000Z"),
  "updatedAt": ISODate("2026-10-17T22:00:00.000Z")
}
```

> **Note**: `transactionId` is initially `null`. Spendings can subsequently be
> linked to financial transactions via `/api/sports/spendings/link`.

---

## 3. Importer Script: `src/sports/scripts/import_sports_data.py`

In `finance-tracker-legacy-data-importer`, create the script:

```python
"""
Import parsed sports CSV entries into MongoDB.

Usage:
    python -m src.sports.scripts.import_sports_data <USER_ID> \\
        --csv-path data/sports/parse/sports_entries.csv \\
        --dry-run
"""

import argparse
import csv
from datetime import datetime, timezone
import os
from bson import ObjectId
from pymongo import MongoClient


def get_db():
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("MONGO_DB")
    if not mongo_uri or not db_name:
        raise ValueError("Missing MONGO_URI or MONGO_DB environment variables.")
    client = MongoClient(mongo_uri)
    return client[db_name]


def resolve_or_create_categories(db, owner_id: ObjectId, category_names: set, dry_run: bool):
    """
    Returns a dict mapping category_name -> category ObjectId.
    Reuses existing system or user categories from 'sportcategories';
    creates missing user categories.
    """
    categories_col = db["sportcategories"]
    category_map = {}

    for name in sorted(category_names):
        name_clean = name.strip()
        norm_name = name_clean.lower()

        # Check system default or user's existing category
        query = {
            "nameNormalized": norm_name,
            "$or": [
                {"type": "system"},
                {"type": "user", "ownerId": owner_id},
            ],
        }
        existing = categories_col.find_one(query)
        if existing:
            category_map[name_clean] = existing["_id"]
        else:
            new_id = ObjectId()
            if not dry_run:
                categories_col.insert_one({
                    "_id": new_id,
                    "ownerId": owner_id,
                    "type": "user",
                    "name": name_clean,
                    "nameNormalized": norm_name,
                    "createdAt": datetime.now(timezone.utc),
                    "updatedAt": datetime.now(timezone.utc),
                })
            category_map[name_clean] = new_id

    return category_map


def import_sports_data(
    owner_id_str: str,
    csv_path: str,
    dry_run: bool = False,
    clean_existing: bool = False,
):
    owner_id = ObjectId(owner_id_str)
    db = get_db()

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    rows = []
    category_names = set()

    with open(csv_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            category = row["category"].strip()
            category_names.add(category)
            rows.append(row)

    print(f"📊 Read {len(rows)} entries across {len(category_names)} categories from {csv_path}")
    print(f"Categories detected: {sorted(list(category_names))}")

    # 1. Resolve or create categories in 'sportcategories'
    category_map = resolve_or_create_categories(db, owner_id, category_names, dry_run)
    print(f"✅ Resolved {len(category_map)} category IDs")

    # 2. Build entry documents
    entries_to_insert = []
    total_cost = 0.0

    now = datetime.now(timezone.utc)
    for r in rows:
        cat_name = r["category"].strip()
        cat_id = category_map[cat_name]
        cost = float(r["cost_pln"])
        total_cost += cost
        dt = datetime.strptime(r["date"].strip(), "%Y-%m-%d").replace(
            tzinfo=timezone.utc
        )

        doc = {
            "ownerId": owner_id,
            "categoryId": cat_id,
            "date": dt,
            "itemName": r["item_name"].strip()[:200],
            "costPln": round(cost, 2),
            "description": None,
            "transactionId": None,
            "createdAt": now,
            "updatedAt": now,
        }
        entries_to_insert.append(doc)

    print(f"💰 Total calculated spendings: {total_cost:,.2f} PLN")

    # 3. Dry run or write to database
    if dry_run:
        print("🔍 DRY RUN: No documents were saved to MongoDB.")
        return

    entries_col = db["sportentries"]

    if clean_existing:
        deleted = entries_col.delete_many({"ownerId": owner_id})
        print(f"🧹 Cleaned {deleted.deleted_count} existing sport entries for user.")

    if entries_to_insert:
        res = entries_col.insert_many(entries_to_insert)
        print(
            f"🚀 Successfully imported {len(res.inserted_ids)} entries into 'sportentries'!"
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import legacy sports data into MongoDB")
    parser.add_argument("user_id", help="MongoDB User ObjectId")
    parser.add_argument(
        "--csv-path",
        default="data/sports/parse/sports_entries.csv",
        help="Path to sports_entries.csv",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate and preview without writing to DB",
    )
    parser.add_argument(
        "--clean-existing",
        action="store_true",
        help="Delete existing entries for user before importing",
    )
    args = parser.parse_args()

    import_sports_data(
        args.user_id,
        args.csv_path,
        args.dry_run,
        args.clean_existing,
    )
```

---

## 4. Execution Workflow

From the `finance-tracker-legacy-data-importer` project root:

```bash
# 1. Activate Python virtual environment
source src/transactions/importing/.venv/bin/activate

# 2. (Optional) Run spreadsheet extractor if new spreadsheet downloaded
./src/sports/parse/extract_sports_tables.sh --should-copy

# 3. Dry-run validation (replace <USER_ID> with user ObjectId)
python -m src.sports.scripts.import_sports_data \
  <USER_ID> \
  --csv-path data/sports/parse/sports_entries.csv \
  --dry-run

# 4. Perform live import
python -m src.sports.scripts.import_sports_data \
  <USER_ID> \
  --csv-path data/sports/parse/sports_entries.csv
```
