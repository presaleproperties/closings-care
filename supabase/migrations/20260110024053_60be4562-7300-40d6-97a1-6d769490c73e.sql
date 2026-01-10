-- Add new tax and expense settings fields
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS gst_registered boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gst_rate numeric DEFAULT 0.05,
ADD COLUMN IF NOT EXISTS tax_buffer_percent numeric DEFAULT 5,
ADD COLUMN IF NOT EXISTS tax_calculation_method text DEFAULT 'progressive',
ADD COLUMN IF NOT EXISTS tax_saved_amount numeric DEFAULT 0;

-- Add new expense fields for better classification
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS is_fixed boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_tax_deductible boolean DEFAULT true;