-- Create rental_properties table
CREATE TABLE public.rental_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  purchase_price NUMERIC(12,2),
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rental_properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own rental properties" 
ON public.rental_properties FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rental properties" 
ON public.rental_properties FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rental properties" 
ON public.rental_properties FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rental properties" 
ON public.rental_properties FOR DELETE 
USING (auth.uid() = user_id);

-- Add rental_property_id to expenses table (nullable)
ALTER TABLE public.expenses 
ADD COLUMN rental_property_id UUID REFERENCES public.rental_properties(id) ON DELETE SET NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_rental_properties_updated_at
BEFORE UPDATE ON public.rental_properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();