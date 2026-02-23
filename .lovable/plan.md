

# Codebase Cleanup Plan

## Overview
This plan addresses 5 categories of issues: duplicated logic, disconnected legacy systems, dead code, incomplete data refresh, and redundant route wrappers.

---

## 1. Extract Shared Transaction Utilities

Create a single shared utility file for transaction logic that's currently duplicated across 3-5 files.

**New file: `src/lib/transactionUtils.ts`**
- Move `TEAM_AGENT_NAMES` constant (single source of truth)
- Move `isTeamDeal()` function
- Move `extractNetPayout()` function
- Move `getEffectiveCommission()` function
- Export a shared `SyncedTransaction` interface

**Files to update (remove local duplicates, import from shared util):**
- `src/hooks/useSyncedDeals.tsx`
- `src/hooks/useSyncedIncome.tsx`
- `src/hooks/useSyncedPayouts.tsx`
- `src/pages/DealDetailPage.tsx`
- `src/components/deals/DealRelatedTransactionsSection.tsx`

---

## 2. Fix `useRefreshData` to Include Synced Data

Update `src/hooks/useRefreshData.tsx` to also invalidate:
- `synced_transactions`
- `platform_connections`
- `sync_logs`
- `revenue_share`
- `pipeline_prospects`

These are the queries the dashboard and deals pages actually depend on.

---

## 3. Remove Duplicate `HomeRoute`

In `src/App.tsx`, delete the `HomeRoute` component and replace its usage with `PublicRoute` on the `/` route. They are functionally identical.

---

## 4. Clean Up Dead `chat_messages` References

Remove the `chat_messages` reference from the `delete-account` edge function cleanup list. The table itself can remain (no data loss risk) but the code reference is dead weight.

---

## 5. Flag Legacy Manual Deals System (No Removal Yet)

The manual deals system (`useDeals`, `usePayouts`, `useCreateDeal`, `useUpdateDeal`, `NewDealPage`, `DealDraftContext`, and the `deals`/`payouts` DB tables) is **disconnected** from the synced transaction system that powers the rest of the app.

**Recommendation:** Do NOT remove yet, but add a note. `NewDealPage` still allows manual deal entry which some users may need for deals outside of ReZen. However, these manual deals won't appear in the main Deals list, Payouts page, Dashboard stats, or Forecast -- which is confusing.

A future step would be to either:
- (A) Unify both systems so manual deals appear alongside synced deals, OR
- (B) Remove manual deals entirely if all deals come through ReZen sync

This is a design decision that needs your input before proceeding.

---

## Technical Details

### File changes summary

| Action | File | What |
|--------|------|------|
| Create | `src/lib/transactionUtils.ts` | Shared transaction utilities |
| Edit | `src/hooks/useSyncedDeals.tsx` | Import from shared util |
| Edit | `src/hooks/useSyncedIncome.tsx` | Import from shared util |
| Edit | `src/hooks/useSyncedPayouts.tsx` | Import from shared util |
| Edit | `src/pages/DealDetailPage.tsx` | Import from shared util |
| Edit | `src/components/deals/DealRelatedTransactionsSection.tsx` | Import from shared util |
| Edit | `src/hooks/useRefreshData.tsx` | Add missing query invalidations |
| Edit | `src/App.tsx` | Remove HomeRoute, use PublicRoute |
| Edit | `supabase/functions/delete-account/index.ts` | Remove chat_messages reference |

No database changes required. No breaking changes to the UI.

