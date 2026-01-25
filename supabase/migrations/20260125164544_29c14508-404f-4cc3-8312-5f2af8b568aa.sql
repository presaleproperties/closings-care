-- Add onboarding_completed column to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;