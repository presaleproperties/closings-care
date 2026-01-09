-- Add property_type and monthly_rent to rental_properties
ALTER TABLE public.rental_properties 
ADD COLUMN property_type TEXT NOT NULL DEFAULT 'rental' CHECK (property_type IN ('personal', 'rental')),
ADD COLUMN monthly_rent NUMERIC(10,2) DEFAULT 0;

-- Rename table to just 'properties' since it now includes personal properties
ALTER TABLE public.rental_properties RENAME TO properties;

-- Update policies to use new table name (policies are automatically renamed with table)