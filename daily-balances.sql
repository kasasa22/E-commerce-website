CREATE TABLE IF NOT EXISTS public.daily_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  balance_date DATE NOT NULL UNIQUE,
  balance_cd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_balances_date ON public.daily_balances(balance_date);

ALTER TABLE public.daily_balances ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All users can view daily balances') THEN
        CREATE POLICY "All users can view daily balances"
        ON public.daily_balances FOR SELECT
        USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can create daily balances') THEN
        CREATE POLICY "Admins can create daily balances"
        ON public.daily_balances FOR INSERT
        WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update daily balances') THEN
        CREATE POLICY "Admins can update daily balances"
        ON public.daily_balances FOR UPDATE
        USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete daily balances') THEN
        CREATE POLICY "Admins can delete daily balances"
        ON public.daily_balances FOR DELETE
        USING (public.get_user_role(auth.uid()) IN ('admin', 'superadmin'));
    END IF;
END $$;

DROP TRIGGER IF EXISTS update_daily_balances_updated_at ON public.daily_balances;
CREATE TRIGGER update_daily_balances_updated_at
  BEFORE UPDATE ON public.daily_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_balance_bd(target_date DATE)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev_balance NUMERIC;
BEGIN
  SELECT balance_cd INTO prev_balance
  FROM public.daily_balances
  WHERE balance_date = target_date - INTERVAL '1 day';

  RETURN COALESCE(prev_balance, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_balance_cd(target_date DATE)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  balance NUMERIC;
BEGIN
  SELECT balance_cd INTO balance
  FROM public.daily_balances
  WHERE balance_date = target_date;

  RETURN balance;
END;
$$;
