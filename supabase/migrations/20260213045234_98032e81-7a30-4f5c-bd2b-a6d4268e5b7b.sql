
-- Drop the trigger that prevents admin self-promotion (references is_admin)
DROP TRIGGER IF EXISTS prevent_admin_self_promotion ON public.profiles;

-- Drop the trigger function
DROP FUNCTION IF EXISTS public.prevent_admin_self_promotion();

-- Remove the is_admin column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_admin;
