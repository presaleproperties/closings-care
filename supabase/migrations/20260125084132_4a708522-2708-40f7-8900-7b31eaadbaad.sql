-- Add brokerage cap tracking fields to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS brokerage_cap_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS brokerage_cap_start_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS brokerage_cap_enabled BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.settings.brokerage_cap_amount IS 'Annual brokerage cap amount - after reaching this, agent keeps 100% of commission';
COMMENT ON COLUMN public.settings.brokerage_cap_start_date IS 'Anniversary date when cap resets each year';
COMMENT ON COLUMN public.settings.brokerage_cap_enabled IS 'Whether brokerage cap tracking is enabled';