-- Drop the existing check constraint on the 'role' column in public.profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add a new check constraint to allow 'Supporto' role along with existing roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('Azienda', 'Squadra', 'Influencer', 'Investitore', 'Supporto'));

-- Ensure the support bot user exists in auth.users
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'support_bot@connecthub.com',
  crypt('dummy_password_for_bot', gen_salt('bf')), -- Dummy encrypted password
  NOW(),
  '{}',
  '{"full_name": "Supporto ConnectHub", "username": "support_bot"}'
) ON CONFLICT (id) DO NOTHING;

-- Ensure the support bot has a profile in public.profiles with the 'Supporto' role
INSERT INTO public.profiles (id, role, full_name, username)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Supporto', -- Assign the 'Supporto' role
  'Supporto ConnectHub',
  'support_bot'
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username;