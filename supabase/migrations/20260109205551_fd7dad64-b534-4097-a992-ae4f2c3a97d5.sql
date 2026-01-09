-- Add recurrence type to expenses table
ALTER TABLE public.expenses 
ADD COLUMN recurrence text DEFAULT 'monthly' CHECK (recurrence IN ('monthly', 'weekly', 'one-time'));