-- SQL Migration for Debtors and Creditors with Payments (Idempotent Version)

-- Debtors table
CREATE TABLE IF NOT EXISTS public.debtors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  remaining_amount NUMERIC(10, 2) NOT NULL CHECK (remaining_amount >= 0),
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creditors table
CREATE TABLE IF NOT EXISTS public.creditors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  remaining_amount NUMERIC(10, 2) NOT NULL CHECK (remaining_amount >= 0),
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table (for both debtors and creditors)
CREATE TABLE IF NOT EXISTS public.finance_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debtor_id UUID REFERENCES public.debtors(id) ON DELETE CASCADE,
  creditor_id UUID REFERENCES public.creditors(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  CONSTRAINT one_target_only CHECK (
    (debtor_id IS NOT NULL AND creditor_id IS NULL) OR
    (debtor_id IS NULL AND creditor_id IS NOT NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE public.debtors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creditors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_payments ENABLE ROW LEVEL SECURITY;

-- Policies (Restricted to Admins)
-- We use DO blocks to avoid "already exists" errors for policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view debtors') THEN
        CREATE POLICY "Admins can view debtors" ON public.debtors FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert debtors') THEN
        CREATE POLICY "Admins can insert debtors" ON public.debtors FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update debtors') THEN
        CREATE POLICY "Admins can update debtors" ON public.debtors FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete debtors') THEN
        CREATE POLICY "Admins can delete debtors" ON public.debtors FOR DELETE USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view creditors') THEN
        CREATE POLICY "Admins can view creditors" ON public.creditors FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert creditors') THEN
        CREATE POLICY "Admins can insert creditors" ON public.creditors FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update creditors') THEN
        CREATE POLICY "Admins can update creditors" ON public.creditors FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete creditors') THEN
        CREATE POLICY "Admins can delete creditors" ON public.creditors FOR DELETE USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view payments') THEN
        CREATE POLICY "Admins can view payments" ON public.finance_payments FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert payments') THEN
        CREATE POLICY "Admins can insert payments" ON public.finance_payments FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;
END $$;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_debtors_updated_at ON public.debtors;
CREATE TRIGGER update_debtors_updated_at BEFORE UPDATE ON public.debtors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_creditors_updated_at ON public.creditors;
CREATE TRIGGER update_creditors_updated_at BEFORE UPDATE ON public.creditors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
