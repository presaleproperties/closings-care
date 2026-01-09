-- Add monthly income goal to settings table
ALTER TABLE public.settings 
ADD COLUMN monthly_income_goal numeric DEFAULT 15000;