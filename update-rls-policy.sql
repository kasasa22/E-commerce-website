-- Update RLS policy to prevent sellers from creating products
-- Drop the old policy
DROP POLICY IF EXISTS "Sellers, Admins, and Superadmins can create products" ON public.products;

-- Create the new policy that only allows admins and superadmins to create products
CREATE POLICY "Admins and Superadmins can create products"
  ON public.products FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'superadmin')
  );

