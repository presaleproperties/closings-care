
-- Drop the broken INSERT policy that uses WITH CHECK (false)
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.admin_audit_logs;

-- No INSERT policy needed — service_role bypasses RLS by default
-- Only the SELECT policy for admins remains
