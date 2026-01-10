-- Add subscription tier to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE;

-- Add a check constraint for valid tiers
ALTER TABLE public.settings 
ADD CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('free', 'pro'));