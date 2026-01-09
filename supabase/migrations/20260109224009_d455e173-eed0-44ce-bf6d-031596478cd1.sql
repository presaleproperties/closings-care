-- Create a table for other income (revenue share, etc.)
CREATE TABLE public.other_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  recurrence TEXT NOT NULL DEFAULT 'monthly',
  start_month TEXT NOT NULL,
  end_month TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.other_income ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own other income" 
ON public.other_income 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own other income" 
ON public.other_income 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own other income" 
ON public.other_income 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own other income" 
ON public.other_income 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_other_income_updated_at
BEFORE UPDATE ON public.other_income
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();