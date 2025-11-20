-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'seller')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  buying_price NUMERIC(10, 2) NOT NULL CHECK (buying_price >= 0),
  selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
  profit NUMERIC(10, 2) NOT NULL,
  sold_by UUID NOT NULL REFERENCES auth.users(id),
  sold_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON public.sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_sold_by ON public.sales(sold_by);
CREATE INDEX IF NOT EXISTS idx_sales_sold_at ON public.sales(sold_at);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Function to get user role (bypasses RLS to prevent infinite recursion)
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

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Superadmins can view all users"
  ON public.users FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Superadmins can update all users"
  ON public.users FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Products policies
CREATE POLICY "Anyone authenticated can view products"
  ON public.products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Sellers, Admins, and Superadmins can create products"
  ON public.products FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('seller', 'admin', 'superadmin')
  );

CREATE POLICY "Admins and Superadmins can update products"
  ON public.products FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) IN ('admin', 'superadmin')
  );

CREATE POLICY "Admins and Superadmins can delete products"
  ON public.products FOR DELETE
  USING (
    public.get_user_role(auth.uid()) IN ('admin', 'superadmin')
  );

-- Sales policies
CREATE POLICY "Anyone authenticated can view sales"
  ON public.sales FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Sellers, Admins, and Superadmins can create sales"
  ON public.sales FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('seller', 'admin', 'superadmin')
  );

CREATE POLICY "Admins and Superadmins can update sales"
  ON public.sales FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) IN ('admin', 'superadmin')
  );

CREATE POLICY "Admins and Superadmins can delete sales"
  ON public.sales FOR DELETE
  USING (
    public.get_user_role(auth.uid()) IN ('admin', 'superadmin')
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'seller')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

