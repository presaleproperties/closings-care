
-- Client Inventory table: stores metadata for synced deals + manual entries
CREATE TABLE public.client_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  -- Link to synced_transactions (nullable for manual entries)
  synced_transaction_id UUID REFERENCES public.synced_transactions(id) ON DELETE SET NULL,
  -- Core fields (enrichment on top of synced data, or all fields for manual)
  buyer_name TEXT,
  project_name TEXT,
  property_address TEXT,
  purchase_date DATE,
  close_date DATE,
  close_date_est DATE,
  purchase_price NUMERIC,
  property_type TEXT, -- 'Condo', 'Townhome', 'Detached Home', 'Presale'
  notes TEXT,
  is_manual BOOLEAN NOT NULL DEFAULT false,
  -- For presale journey grouping
  journey_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_client_inventory_user_id ON public.client_inventory(user_id);
CREATE INDEX idx_client_inventory_synced_tx ON public.client_inventory(synced_transaction_id);
CREATE INDEX idx_client_inventory_journey_id ON public.client_inventory(journey_id);
CREATE INDEX idx_client_inventory_property_type ON public.client_inventory(user_id, property_type);

-- Enable RLS
ALTER TABLE public.client_inventory ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own client inventory"
  ON public.client_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client inventory"
  ON public.client_inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client inventory"
  ON public.client_inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client inventory"
  ON public.client_inventory FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_client_inventory_updated_at
  BEFORE UPDATE ON public.client_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
