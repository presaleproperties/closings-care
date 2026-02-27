
-- =====================================================================
-- Admin Audit Log Table
-- Records all sensitive admin actions: viewing user data, modifying
-- accounts, changing subscriptions, deleting users, etc.
-- =====================================================================

CREATE TABLE public.admin_audit_logs (
  id            UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,                     -- who performed the action
  target_user_id UUID,                             -- which user was affected (null for list views)
  action        TEXT NOT NULL,                     -- e.g. 'view_users', 'edit_user', 'delete_user'
  details       JSONB,                             -- extra context (changed fields, old values, etc.)
  ip_address    TEXT,                              -- client IP if available
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Only service_role can insert (edge functions use service role to write logs)
-- No direct client inserts allowed
CREATE POLICY "Service role can insert audit logs"
  ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (false);  -- blocks all anon/authenticated inserts; service_role bypasses RLS

-- No updates or deletes — audit logs are immutable
-- (no policies created = blocked for all non-service-role)

-- Index for fast lookups by admin and target
CREATE INDEX idx_audit_logs_admin    ON public.admin_audit_logs (admin_user_id, created_at DESC);
CREATE INDEX idx_audit_logs_target   ON public.admin_audit_logs (target_user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action   ON public.admin_audit_logs (action, created_at DESC);
