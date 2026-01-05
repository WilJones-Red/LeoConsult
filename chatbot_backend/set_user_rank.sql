-- Set user metadata for your account with admin rank
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users

-- First, find your user ID:
SELECT id, email FROM auth.users WHERE email = 'official@wilkinjones.com';

-- Then update your user metadata (replace the UUID below with your actual user ID):
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"rank": "super_admin"}'::jsonb
WHERE email = 'official@wilkinjones.com';

-- Verify it worked:
SELECT email, raw_user_meta_data FROM auth.users WHERE email = 'official@wilkinjones.com';
