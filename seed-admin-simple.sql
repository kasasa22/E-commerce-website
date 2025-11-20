-- Seed Admin User
-- Step 1: Create user in Supabase Dashboard:
-- Go to: Authentication > Users > Add User
-- Email: admin@example.com (or your desired email)
-- Password: YourPassword123!
-- Auto Confirm User: ON
--
-- Step 2: Run this SQL command to set role to admin:

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@example.com';

