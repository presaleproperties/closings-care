
-- =====================================================================
-- SECURITY FIX 1: Prevent users from self-modifying subscription fields
-- Replace the permissive UPDATE policy with a column-restricted trigger
-- =====================================================================

-- Drop the old broad UPDATE policy
DROP POLICY IF EXISTS "Users can update their own settings" ON public.settings;

-- Create a new UPDATE policy that only allows non-subscription fields
-- Subscription fields (tier, started_at, ends_at) are managed server-side only
CREATE POLICY "Users can update their own settings"
ON public.settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
);

-- Use a BEFORE UPDATE trigger to block subscription field changes by non-service callers.
-- The trigger uses current_setting to detect service role.
CREATE OR REPLACE FUNCTION public.prevent_subscription_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role to change subscription fields (webhooks, admin functions)
  IF current_setting('role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- If user is trying to change subscription_tier, block it
  IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
    RAISE EXCEPTION 'Unauthorized: subscription_tier cannot be modified directly';
  END IF;

  IF NEW.subscription_started_at IS DISTINCT FROM OLD.subscription_started_at THEN
    RAISE EXCEPTION 'Unauthorized: subscription_started_at cannot be modified directly';
  END IF;

  IF NEW.subscription_ends_at IS DISTINCT FROM OLD.subscription_ends_at THEN
    RAISE EXCEPTION 'Unauthorized: subscription_ends_at cannot be modified directly';
  END IF;

  RETURN NEW;
END;
$$;

-- Attach the trigger to settings table
DROP TRIGGER IF EXISTS prevent_subscription_self_update_trigger ON public.settings;
CREATE TRIGGER prevent_subscription_self_update_trigger
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_self_update();


-- =====================================================================
-- SECURITY FIX 2: Add DELETE policy to sync_logs so users can clean up
-- =====================================================================
CREATE POLICY "Users can delete their own sync logs"
ON public.sync_logs
FOR DELETE
USING (auth.uid() = user_id);
