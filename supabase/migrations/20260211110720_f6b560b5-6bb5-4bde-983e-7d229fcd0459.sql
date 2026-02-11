
-- Table for storing network agents (frontline, downline by tier)
CREATE TABLE public.network_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL DEFAULT 'real_broker',
  agent_yenta_id TEXT NOT NULL,
  agent_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  tier INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'ACTIVE',
  sponsor_name TEXT,
  join_date DATE,
  departure_date DATE,
  days_with_brokerage INTEGER,
  raw_data JSONB,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, agent_yenta_id)
);

ALTER TABLE public.network_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own network agents"
  ON public.network_agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own network agents"
  ON public.network_agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own network agents"
  ON public.network_agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own network agents"
  ON public.network_agents FOR DELETE
  USING (auth.uid() = user_id);

-- Table for network revenue/performance summary
CREATE TABLE public.network_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL DEFAULT 'real_broker',
  total_network_agents INTEGER DEFAULT 0,
  co_sponsored_agents INTEGER DEFAULT 0,
  total_revshare_income NUMERIC DEFAULT 0,
  network_size_by_tier JSONB,
  revshare_by_tier JSONB,
  revshare_performance JSONB,
  agent_cap_info JSONB,
  raw_data JSONB,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE public.network_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own network summary"
  ON public.network_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own network summary"
  ON public.network_summary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own network summary"
  ON public.network_summary FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own network summary"
  ON public.network_summary FOR DELETE
  USING (auth.uid() = user_id);
