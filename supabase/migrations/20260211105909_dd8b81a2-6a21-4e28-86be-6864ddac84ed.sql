-- Add unique constraint for revenue_share upserts from ReZen sync
CREATE UNIQUE INDEX IF NOT EXISTS revenue_share_user_platform_agent_period_key 
ON public.revenue_share (user_id, platform, agent_name, period);