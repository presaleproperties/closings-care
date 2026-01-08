-- Create enums for deal and payout statuses
CREATE TYPE public.deal_status AS ENUM ('PENDING', 'CLOSED');
CREATE TYPE public.deal_type AS ENUM ('BUY', 'SELL');
CREATE TYPE public.payout_status AS ENUM ('PROJECTED', 'INVOICED', 'PAID');
CREATE TYPE public.payout_type AS ENUM ('Advance', '2nd Payment', '3rd Deposit', '4th Deposit', 'Completion', 'Custom');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'CAD',
  tax_set_aside_percent NUMERIC(5,2) DEFAULT 0,
  brokerage_split_percent NUMERIC(5,2) DEFAULT 0,
  apply_tax_to_forecasts BOOLEAN NOT NULL DEFAULT false,
  presale_template JSONB DEFAULT '["Advance", "2nd Payment", "3rd Deposit", "4th Deposit", "Completion"]'::jsonb,
  resale_template JSONB DEFAULT '["Completion"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create deals table
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  deal_type public.deal_type NOT NULL,
  address TEXT,
  project_name TEXT,
  city TEXT DEFAULT 'Vancouver',
  listing_date DATE,
  pending_date DATE,
  close_date_est DATE,
  close_date_actual DATE,
  sale_price NUMERIC(15,2),
  gross_commission_est NUMERIC(15,2),
  net_commission_est NUMERIC(15,2),
  gross_commission_actual NUMERIC(15,2),
  net_commission_actual NUMERIC(15,2),
  team_member TEXT,
  team_member_portion NUMERIC(5,2) DEFAULT 0,
  lead_source TEXT,
  notes TEXT,
  status public.deal_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payouts table
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  payout_type public.payout_type NOT NULL,
  custom_type_name TEXT,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  due_date DATE,
  status public.payout_status NOT NULL DEFAULT 'PROJECTED',
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  month TEXT NOT NULL, -- Format: YYYY-MM
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view their own settings" ON public.settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Deals policies
CREATE POLICY "Users can view their own deals" ON public.deals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deals" ON public.deals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals" ON public.deals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals" ON public.deals
  FOR DELETE USING (auth.uid() = user_id);

-- Payouts policies
CREATE POLICY "Users can view their own payouts" ON public.payouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payouts" ON public.payouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payouts" ON public.payouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payouts" ON public.payouts
  FOR DELETE USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view their own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_deals_user_id ON public.deals(user_id);
CREATE INDEX idx_deals_status ON public.deals(status);
CREATE INDEX idx_payouts_user_id ON public.payouts(user_id);
CREATE INDEX idx_payouts_deal_id ON public.payouts(deal_id);
CREATE INDEX idx_payouts_due_date ON public.payouts(due_date);
CREATE INDEX idx_payouts_status ON public.payouts(status);
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_month ON public.expenses(month);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_payouts_updated_at BEFORE UPDATE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to auto-create profile and settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();