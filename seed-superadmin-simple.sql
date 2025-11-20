-- Step 1: Create user in Supabase Dashboard:
-- Go to: Authentication > Users > Add User
-- Email: kasasatrevor25@gmail.com
-- Password: Kasasa@3843.
-- Auto Confirm User: ON
--
-- Step 2: Run this SQL command:

UPDATE public.users 
SET role = 'superadmin' 
WHERE email = 'kasasatrevor25@gmail.com';
