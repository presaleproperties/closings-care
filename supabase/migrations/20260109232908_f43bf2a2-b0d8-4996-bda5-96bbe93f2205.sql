-- Add property-specific financial fields
ALTER TABLE public.properties 
ADD COLUMN monthly_mortgage NUMERIC(10,2) DEFAULT 0,
ADD COLUMN monthly_strata NUMERIC(10,2) DEFAULT 0,
ADD COLUMN yearly_taxes NUMERIC(10,2) DEFAULT 0;