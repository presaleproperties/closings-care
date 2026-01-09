-- Drop the existing check constraint and add a new one with 'yearly' option
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_recurrence_check;

ALTER TABLE public.expenses ADD CONSTRAINT expenses_recurrence_check 
CHECK (recurrence IN ('monthly', 'weekly', 'one-time', 'yearly'));