
-- Create ai_usage table for per-user rate limiting
CREATE TABLE public.ai_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  request_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Users can only read their own usage
CREATE POLICY "Users can view their own ai usage"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Service role handles inserts/updates (edge function uses service role)
-- No client INSERT policy needed — edge function uses service role

-- Ensure prevent_subscription_self_update_trigger exists and recreate if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_subscription_self_update_trigger'
  ) THEN
    CREATE TRIGGER prevent_subscription_self_update_trigger
      BEFORE UPDATE ON public.settings
      FOR EACH ROW
      EXECUTE FUNCTION public.prevent_subscription_self_update();
  END IF;
END;
$$;
