-- Add presale-specific financial and date fields
ALTER TABLE public.deals 
ADD COLUMN advance_commission numeric,
ADD COLUMN completion_commission numeric,
ADD COLUMN advance_date date,
ADD COLUMN completion_date date;