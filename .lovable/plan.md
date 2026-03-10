
## Understanding the data & system

**GCI/Deal count tracking** lives in `synced_transactions` (what the Analytics page, DealsWrittenCard, and Dashboard use). The `deals` table is for manually entered deals but the analytics engine reads only `synced_transactions`. To make this data show up in GCI charts and deal counts, these historical entries need to go into `synced_transactions`, not the `deals` table.

**Client Inventory** reads from both `synced_transactions` (via `useSyncedDeals` → `useClientInventory`) AND from `client_inventory` for manual-only entries. Since we're inserting into `synced_transactions`, they'll automatically flow into inventory too.

**Data I've extracted from the spreadsheet:**

| # | Client | Project/Location | Firm Date | Sale Price | Commission | Notes |
|---|--------|-----------------|-----------|------------|------------|-------|
| 0 | Amar Parmar | The Grand | 2024-11-01 | $499,000 | $8,286 | Presale |
| 1 | Amar Parmar | The Grand | 2024-11-01 | $498,000 | $8,201 | Presale |
| 2 | Enamul Kazi | The Holland | 2023-11-01 | $499,500 | $10,145 | Presale |
| 3 | Zeynah Khan | Surrey | 2021-09-16 | $360,000 | $6,552 | |
| 4 | Shehzal Nisar | Surrey | 2021-10-22 | $740,000 | $11,130 | |
| 5 | Ravish Passy | Quinn | 2023-06-01 | $379,000 | $8,350 | Presale |
| 6 | Harman Cricket | Hendrix | 2023-06-01 | $464,900 | $10,578 | Presale |
| 7 | Afzaal Pirzada | North Van | 2021-11-04 | $1,680,000 | $23,564 | |
| 8 | Amrin Satani | Surrey | 2021-12-16 | $549,000 | $8,803 | |
| 9 | Hafiz & Nazir Strata Conversion | — | 2022-03-01 | — | $4,100 | Special/commission-only |
| 10 | Manpreet & Satwant | Holland 2 | 2025-05-01 | $484,900 | $10,401 | Presale |
| 11 | Faroque | Holland 2 | 2025-05-01 | $632,900 | $12,900 | Presale |
| 12 | Kuldip | Holland 2 | 2025-05-01 | $691,900 | $13,840 | Presale |
| 13 | Kamrul Khan | Holland 2 | 2025-05-01 | $662,900 | $6,000 | Presale |
| 14 | Holland 2 Bonus | — | — | — | $3,000 | Bonus payment only |
| 15 | Akash Puri | Kelowna | 2022-01-28 | $700,000 | $13,125 | |
| 16 | Mehreen Chuadry | Eastin | 2022-01-28 | $469,900 | $7,842 | Presale |
| 17 | Ravish Passy | Abbotsford | 2022-01-15 | $365,090 | $5,933 | |
| 18 | Manjinder Brar | Langley | 2022-03-15 | $981,000 | $13,452 | |
| 19 | Tajinder Singh Gulati | Langley | 2022-01-19 | $660,000 | $10,143 | |
| 20 | Hamza Khan | Squamish | 2022-02-28 | $675,000 | $9,791 | |
| 21 | Akash Puri (LEASE) | Surrey | 2022-01-10 | $2,850 | $2,850 | Lease/rental |
| 22 | Harsimran Sekhon | Surrey | — | $5,000 | $2,500 | No date |

**Notes on ambiguous rows:**
- Row 9 (Hafiz & Nazir Strata) and Row 14 (Holland 2 Bonus) are commission-only payments with no sale price — I'll insert them with `commission_amount` only, `sale_price` as null
- Row 21 (Akash Puri LEASE) is a lease deal — I'll flag it as a listing/special type
- Row 22 (Harsimran Sekhon) has no date — I'll insert with null firm_date so it appears in the inventory but not in time-based GCI charts

**Data points that will be captured per record:**
- `client_name` — Buyer's name
- `project_name` — Project or area (from raw_data)
- `property_address` — City/location
- `city` — Normalized city
- `firm_date` — The date shown in the spreadsheet (purchase/firm date)
- `sale_price` — Purchase price
- `commission_amount` — GCI earned
- `status` — `'closed'` for all (these are historical completed deals)
- `platform` — `'manual'` to distinguish from ReZen synced
- `is_listing` — `false` for buyer deals
- `transaction_type` — `'presale'` or `'resale'` based on project name context

## Plan

**Step 1 — Insert 23 records into `synced_transactions`**

Use a database migration (INSERT SQL) with `platform = 'manual'`, `status = 'closed'`, using the data from the spreadsheet.

Presale records (have project names): Amar Parmar ×2 (The Grand), Enamul Kazi (The Holland), Ravish Passy (Quinn), Harman Cricket (Hendrix), Manpreet & Satwant (Holland 2), Faroque (Holland 2), Kuldip (Holland 2), Kamrul Khan (Holland 2), Mehreen Chuadry (Eastin)

The `raw_data` JSONB column will store `{ "projectName": "The Grand" }` so the analytics engine correctly identifies presale deals and project grouping.

**Step 2 — Update `useAnalyticsData` date filter**

The current filter cuts off data before 2023-01-01 (hardcoded `minDate`). 2021 and 2022 deals won't appear. We need to either:
- Lower the min date floor to 2021-01-01
- Or make it dynamic (use earliest available data)

I'll update it to use the earliest transaction date dynamically so all inserted history appears.

**Step 3 — Update `DealsWrittenCard` similarly**

The dashboard DealsWrittenCard already uses min/max from data — this will auto-update once records are inserted. No change needed there.

**Step 4 — Update `availableYears` in analytics**

Currently hardcodes start from 2023. Change to 2021 so 2021 and 2022 are selectable year filters.

**What data points appear in Client Inventory from these records:**

Since they go into `synced_transactions`, they'll flow through `useSyncedDeals` → `useClientInventory`. Each will show:
- Buyer name (from `client_name`)
- Project name (from `raw_data.projectName`)
- Property address (from `property_address` / `city`)
- Firm date → Purchase date
- Sale price → Purchase price
- Status → Closed
- Platform badge → Manual

**Files to change:**
1. Database migration — INSERT 23 rows into `synced_transactions`
2. `src/hooks/useAnalyticsData.tsx` — remove hard 2023 floor, make it dynamic from 2021
3. `src/pages/AnalyticsPage.tsx` — verify available years starts from 2021

No schema changes needed — `synced_transactions` already has all required columns.
