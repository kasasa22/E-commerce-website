CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = user_id;

  RETURN COALESCE(user_role, 'seller');
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON public.expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);

CREATE TABLE IF NOT EXISTS public.banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  account_number TEXT,
  account_name TEXT,
  branch TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banks_is_active ON public.banks(is_active);

CREATE TABLE IF NOT EXISTS public.bank_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  agent_name TEXT NOT NULL,
  reference_number TEXT,
  notes TEXT,
  deposit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  deposited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_deposits_bank_id ON public.bank_deposits(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_deposits_deposited_by ON public.bank_deposits(deposited_by);
CREATE INDEX IF NOT EXISTS idx_bank_deposits_deposit_date ON public.bank_deposits(deposit_date);
CREATE INDEX IF NOT EXISTS idx_bank_deposits_created_at ON public.bank_deposits(created_at);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_deposits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All users can view expenses') THEN
        CREATE POLICY "All users can view expenses"
        ON public.expenses FOR SELECT
        USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All users can create expenses') THEN
        CREATE POLICY "All users can create expenses"
        ON public.expenses FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update expenses') THEN
        CREATE POLICY "Admins can update expenses"
        ON public.expenses FOR UPDATE
        USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete expenses') THEN
        CREATE POLICY "Admins can delete expenses"
        ON public.expenses FOR DELETE
        USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All users can view banks') THEN
        CREATE POLICY "All users can view banks"
        ON public.banks FOR SELECT
        USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can create banks') THEN
        CREATE POLICY "Admins can create banks"
        ON public.banks FOR INSERT
        WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update banks') THEN
        CREATE POLICY "Admins can update banks"
        ON public.banks FOR UPDATE
        USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete banks') THEN
        CREATE POLICY "Admins can delete banks"
        ON public.banks FOR DELETE
        USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers can view own deposits today') THEN
        CREATE POLICY "Sellers can view own deposits today"
        ON public.bank_deposits FOR SELECT
        USING (
            public.get_user_role(auth.uid()) = 'seller'
            AND deposited_by = auth.uid()
            AND deposit_date = CURRENT_DATE
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all deposits') THEN
        CREATE POLICY "Admins can view all deposits"
        ON public.bank_deposits FOR SELECT
        USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All users can create deposits') THEN
        CREATE POLICY "All users can create deposits"
        ON public.bank_deposits FOR INSERT
        WITH CHECK (auth.role() = 'authenticated' AND deposited_by = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update deposits') THEN
        CREATE POLICY "Admins can update deposits"
        ON public.bank_deposits FOR UPDATE
        USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete deposits') THEN
        CREATE POLICY "Admins can delete deposits"
        ON public.bank_deposits FOR DELETE
        USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;
END $$;

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_banks_updated_at ON public.banks;
CREATE TRIGGER update_banks_updated_at
  BEFORE UPDATE ON public.banks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bank_deposits_updated_at ON public.bank_deposits;
CREATE TRIGGER update_bank_deposits_updated_at
  BEFORE UPDATE ON public.bank_deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE VIEW public.bank_totals AS
SELECT
  b.id AS bank_id,
  b.name AS bank_name,
  b.account_number,
  b.is_active,
  COALESCE(SUM(bd.amount), 0) AS total_deposited,
  COUNT(bd.id) AS deposit_count
FROM public.banks b
LEFT JOIN public.bank_deposits bd ON b.id = bd.bank_id
GROUP BY b.id, b.name, b.account_number, b.is_active;

CREATE OR REPLACE VIEW public.daily_deposits_summary AS
SELECT
  bd.deposit_date,
  b.name AS bank_name,
  SUM(bd.amount) AS total_amount,
  COUNT(bd.id) AS deposit_count
FROM public.bank_deposits bd
JOIN public.banks b ON bd.bank_id = b.id
GROUP BY bd.deposit_date, b.name
ORDER BY bd.deposit_date DESC, b.name;

CREATE OR REPLACE VIEW public.all_banks_total AS
SELECT
  COALESCE(SUM(amount), 0) AS grand_total,
  COUNT(id) AS total_deposits
FROM public.bank_deposits;

CREATE OR REPLACE FUNCTION public.get_bank_total(bank_uuid UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total
  FROM public.bank_deposits
  WHERE bank_id = bank_uuid;

  RETURN total;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_banks_total()
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total
  FROM public.bank_deposits;

  RETURN total;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_today_deposits(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  bank_name TEXT,
  amount NUMERIC,
  agent_name TEXT,
  deposit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bd.id,
    b.name AS bank_name,
    bd.amount,
    bd.agent_name,
    bd.deposit_date,
    bd.created_at
  FROM public.bank_deposits bd
  JOIN public.banks b ON bd.bank_id = b.id
  WHERE bd.deposited_by = user_uuid
    AND bd.deposit_date = CURRENT_DATE
  ORDER BY bd.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_daily_expenses_total(target_date DATE DEFAULT CURRENT_DATE)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total
  FROM public.expenses
  WHERE expense_date = target_date;

  RETURN total;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_monthly_expenses_total(target_month INTEGER, target_year INTEGER)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total
  FROM public.expenses
  WHERE EXTRACT(MONTH FROM expense_date) = target_month
    AND EXTRACT(YEAR FROM expense_date) = target_year;

  RETURN total;
END;
$$;
