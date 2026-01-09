-- Add tax jurisdiction and type fields to settings
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'CA',
ADD COLUMN IF NOT EXISTS province TEXT DEFAULT 'BC',
ADD COLUMN IF NOT EXISTS tax_type TEXT DEFAULT 'self-employed';