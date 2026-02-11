
-- Add extracted fields to synced_transactions
ALTER TABLE public.synced_transactions
  ADD COLUMN IF NOT EXISTS firm_date date,
  ADD COLUMN IF NOT EXISTS journey_id text,
  ADD COLUMN IF NOT EXISTS mls_number text,
  ADD COLUMN IF NOT EXISTS is_listing boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS my_split_percent numeric,
  ADD COLUMN IF NOT EXISTS lifecycle_state text,
  ADD COLUMN IF NOT EXISTS compliance_status text,
  ADD COLUMN IF NOT EXISTS lead_source text,
  ADD COLUMN IF NOT EXISTS my_net_payout numeric,
  ADD COLUMN IF NOT EXISTS transaction_code text,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'CAD';

-- Add extracted fields to network_agents
ALTER TABLE public.network_agents
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS network_size integer DEFAULT 0;

-- Index journey_id for presale grouping
CREATE INDEX IF NOT EXISTS idx_synced_transactions_journey_id ON public.synced_transactions(journey_id) WHERE journey_id IS NOT NULL;

-- Index firm_date for deals-written queries
CREATE INDEX IF NOT EXISTS idx_synced_transactions_firm_date ON public.synced_transactions(firm_date) WHERE firm_date IS NOT NULL;

-- Index lifecycle_state for filtering
CREATE INDEX IF NOT EXISTS idx_synced_transactions_lifecycle_state ON public.synced_transactions(lifecycle_state);
