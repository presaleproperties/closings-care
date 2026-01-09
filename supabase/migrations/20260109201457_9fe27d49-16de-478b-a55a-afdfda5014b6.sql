-- Create property type enum
CREATE TYPE public.property_type AS ENUM ('PRESALE', 'RESALE');

-- Add property_type column to deals
ALTER TABLE public.deals ADD COLUMN property_type public.property_type;