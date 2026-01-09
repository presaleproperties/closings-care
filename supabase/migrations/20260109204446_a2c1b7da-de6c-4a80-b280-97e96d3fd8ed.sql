-- Add buyer_type column to deals table
ALTER TABLE public.deals 
ADD COLUMN buyer_type text;