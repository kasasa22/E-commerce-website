-- Seed Superadmin User
-- Run this in your Supabase SQL Editor
-- Replace the email and password with your desired credentials

DO $$
DECLARE
  new_user_id UUID;
  user_email TEXT := 'admin@example.com';
  user_password TEXT := 'Admin123!';
  user_name TEXT := 'Super Admin';
BEGIN
  -- Create user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', user_name, 'role', 'superadmin'),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Insert into public.users table with superadmin role
  INSERT INTO public.users (id, name, email, role)
  VALUES (new_user_id, user_name, user_email, 'superadmin')
  ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

  RAISE NOTICE 'Superadmin user created with ID: %', new_user_id;
  RAISE NOTICE 'Email: %', user_email;
  RAISE NOTICE 'Password: %', user_password;
END $$;

