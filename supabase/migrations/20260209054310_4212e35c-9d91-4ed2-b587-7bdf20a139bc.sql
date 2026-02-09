
-- Create pipeline prospects table for tracking potential commissions
CREATE TABLE public.pipeline_prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  home_type TEXT NOT NULL DEFAULT 'Residential',
  potential_commission NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pipeline_prospects ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own prospects"
ON public.pipeline_prospects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prospects"
ON public.pipeline_prospects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prospects"
ON public.pipeline_prospects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospects"
ON public.pipeline_prospects FOR DELETE
USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_pipeline_prospects_updated_at
BEFORE UPDATE ON public.pipeline_prospects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
