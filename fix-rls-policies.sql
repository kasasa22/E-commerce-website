-- Fix infinite recursion in users table RLS policies
-- Run this in your Supabase SQL Editor

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Superadmins can view all users" ON public.users;
DROP POLICY IF EXISTS "Superadmins can update all users" ON public.users;

-- Create a SECURITY DEFINER function to check user role (bypasses RLS)
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

-- Recreate policies using the function
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Superadmins can view all users"
  ON public.users FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Superadmins can update all users"
  ON public.users FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'superadmin');

