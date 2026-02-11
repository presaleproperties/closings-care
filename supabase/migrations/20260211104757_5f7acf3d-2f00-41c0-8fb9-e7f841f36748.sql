
-- Platform connections table (stores encrypted API keys per platform per user)
CREATE TABLE public.platform_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'lofty', 'real_broker', 'skyslope', 'follow_up_boss'
  api_key TEXT, -- encrypted API key
  api_secret TEXT, -- optional secondary credential
  base_url TEXT, -- platform API base URL override
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'idle', -- 'idle', 'syncing', 'success', 'error'
  sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections" ON public.platform_connections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own connections" ON public.platform_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own connections" ON public.platform_connections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own connections" ON public.platform_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Synced transactions from external platforms
CREATE TABLE public.synced_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  external_id TEXT, -- ID from the external platform
  transaction_type TEXT, -- 'listing', 'pending', 'closed'
  client_name TEXT,
  property_address TEXT,
  city TEXT,
  sale_price NUMERIC,
  commission_amount NUMERIC,
  close_date DATE,
  listing_date DATE,
  status TEXT,
  agent_name TEXT,
  raw_data JSONB, -- full raw response for reference
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, external_id)
);

ALTER TABLE public.synced_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own synced transactions" ON public.synced_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own synced transactions" ON public.synced_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own synced transactions" ON public.synced_transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own synced transactions" ON public.synced_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Revenue share tracking (manual entry for now since Real Broker has no public API)
CREATE TABLE public.revenue_share (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL DEFAULT 'real_broker',
  agent_name TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 1, -- 1-5
  amount NUMERIC NOT NULL DEFAULT 0,
  period TEXT NOT NULL, -- '2026-01', '2026-02' etc
  cap_contribution NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid'
  notes TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_share ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own revenue share" ON public.revenue_share
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own revenue share" ON public.revenue_share
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own revenue share" ON public.revenue_share
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own revenue share" ON public.revenue_share
  FOR DELETE USING (auth.uid() = user_id);

-- Sync logs for tracking sync history
CREATE TABLE public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  sync_type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'scheduled'
  status TEXT NOT NULL DEFAULT 'started', -- 'started', 'success', 'error'
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync logs" ON public.sync_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sync logs" ON public.sync_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_platform_connections_updated_at
  BEFORE UPDATE ON public.platform_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_synced_transactions_updated_at
  BEFORE UPDATE ON public.synced_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenue_share_updated_at
  BEFORE UPDATE ON public.revenue_share
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
