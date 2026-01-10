-- First, drop the problematic RLS policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can view all deals" ON public.deals;

-- Create a security definer function to check admin status
-- This avoids infinite recursion by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE user_id = _user_id),
    false
  )
$$;

-- Recreate admin policies using the function
CREATE POLICY "Admins can view all settings"
ON public.settings
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR public.is_admin(auth.uid())
);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR public.is_admin(auth.uid())
);

CREATE POLICY "Admins can view all deals"
ON public.deals
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR public.is_admin(auth.uid())
);