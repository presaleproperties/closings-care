
## Landing Page Refresh: Audience Clarity + Integration Showcase

### Goal
Make it immediately clear the product is built exclusively for **Real Brokerage agents** (not just "Canadian realtors"), highlight the direct ReZen connection as the #1 differentiator, and add a dedicated integrations section showing ReZen (live), SkySlope (coming soon), and Lofty (coming soon).

---

### Changes Overview

#### 1. Hero Section — Audience Signal
- Change badge from `"BUILT FOR CANADIAN REALTORS"` → `"BUILT FOR REAL BROKERAGE AGENTS"`
- Update headline to reinforce the Real Brokerage connection — e.g. *"Financial Clarity for Every Real Deal"*
- Update sub-copy to call out the auto-sync: *"Connect your ReZen account once. Your deals, commissions, and rev share sync automatically."*
- Add a third hero trust tag: `"Syncs directly with ReZen"`
- Replace hero stat card's generic numbers with a "Connected to ReZen" badge/indicator in the card

#### 2. New "Integrations" Section — placed after HowItWorks, before DealTypes
A dedicated section with:
- Header: *"Connects to the tools you already use"*
- Three integration tiles in a row:
  - **ReZen** — `LIVE` green badge — *"Auto-sync your deals, payouts, rev share, and network. Connect once and everything stays up to date."*
  - **SkySlope** — `COMING SOON` amber badge — *"Transaction coordination data synced directly into your deal pipeline."*
  - **Lofty (Chime)** — `COMING SOON` amber badge — *"CRM contacts and pipeline leads coming straight into your pipeline view."*
- Each tile: platform logo placeholder (icon-based), name, badge, description, and a subtle animated pulse on the LIVE badge

#### 3. HowItWorks Section — Update Step 1
- Change "Add your deals" → "Connect ReZen once"
- Update description: *"Paste your ReZen API key in Settings. Deals, commissions, and rev share populate automatically — no manual entry."*
- Keep Steps 2 & 3 as-is (the math, the clarity)

#### 4. Features Section — Add "ReZen Auto-Sync" Feature Card
- Insert a new feature card at position 1 (before Safe-to-Spend):
  - Icon: `Zap` or `RefreshCw`
  - Title: "Auto-Sync from ReZen"
  - Desc: *"Connect once and your deals, payouts, and rev share populate automatically. No manual entry."*
  - Highlights: Auto-imports deals, Rev share tracking, Network data synced, Payouts auto-matched
  - Gradient: `from-emerald-600 to-green-500`
- This makes the grid 7 features — adjust to `lg:grid-cols-3 md:grid-cols-2` which already handles it by wrapping

#### 5. Pain Section — Add a ReZen-specific pain
- Replace one of the 4 generic pains with a more targeted one:
  - Icon: `RefreshCw`
  - Question: *"Why am I manually entering deals I already closed in ReZen?"*
  - Detail: *"You close a deal in ReZen, then re-enter it somewhere else for tracking. That's wasted time on work you already did."*

#### 6. Testimonials — Update brokerage names
- Change all testimonials to reference **Real Brokerage** agents specifically:
  - "Sarah M. — Real Brokerage, Vancouver"
  - "David C. — Real Brokerage, Burnaby"  
  - "Jennifer L. — Real Brokerage, Calgary"
- This reinforces the product is purpose-built for this audience

#### 7. FAQ — Add ReZen-specific question
- Add: *"Does it work with other brokerages?"* → *"Right now, dealzflow is purpose-built for Real Brokerage agents using ReZen. SkySlope and Lofty integrations are coming soon."*

---

### Technical Details

**Files changed:**
- `src/pages/LandingPage.tsx` — all changes above in one file

**New imports needed:**
- `RefreshCw`, `Wifi`, `Clock` from `lucide-react` (for new cards/icons)

**New component added inside the file:**
```tsx
function IntegrationsSection() { ... }
```
Inserted between `<HowItWorksSection />` and `<DealTypesSection />` in the main render.

**Integration tile structure:**
```text
┌─────────────────────────────────────┐
│  [Icon]  ReZen          ● LIVE      │
│  Auto-sync deals, payouts, rev...   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  [Icon]  SkySlope    ◌ COMING SOON  │
│  Transaction coordination data...   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  [Icon]  Lofty (Chime) ◌ COMING SOON│
│  CRM contacts and pipeline leads... │
└─────────────────────────────────────┘
```

No database changes required. No new dependencies needed.
