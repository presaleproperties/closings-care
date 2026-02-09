
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table (separate from profiles to prevent privilege escalation)
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (bypasses RLS, no recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Users can check their own roles
CREATE POLICY "Users can check their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all roles  
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- No INSERT/UPDATE/DELETE policies — only service_role can manage roles
-- This is intentional to prevent privilege escalation

-- Migrate existing admin users from profiles.is_admin to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.profiles
WHERE is_admin = true
ON CONFLICT (user_id, role) DO NOTHING;

-- Update is_admin() function to use user_roles table as source of truth
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
    )),
    false
  )
$$;

-- Add trigger to prevent users from self-promoting via profiles.is_admin (defense in depth)
CREATE OR REPLACE FUNCTION public.prevent_admin_self_promotion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    NEW.is_admin := OLD.is_admin;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_admin_self_promotion
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_admin_self_promotion();
