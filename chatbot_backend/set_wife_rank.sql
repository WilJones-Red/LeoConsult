-- Set rank for your wife's account
-- This script sets the user metadata with the rank field needed for portal access

-- Step 1: Find the user account (replace with your wife's actual email)
-- SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'YOUR_WIFE_EMAIL_HERE';

-- Step 2: Set the appropriate rank
-- Replace 'YOUR_WIFE_EMAIL_HERE' with her actual email address
-- Choose the appropriate rank from the options below

UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"rank": "employee"}'::jsonb
WHERE email = 'YOUR_WIFE_EMAIL_HERE';

-- Step 3: Verify the rank was set correctly
-- SELECT email, raw_user_meta_data FROM auth.users WHERE email = 'YOUR_WIFE_EMAIL_HERE';

-- Available ranks (hierarchical):
-- - 'employee' or 'staff': Can access employee portal only (no admin panel access)
-- - 'admin': Can access employee portal AND admin panel for managing chatbot
-- - 'super_admin': Full administrative access to everything
--
-- To change rank, replace 'employee' in the UPDATE query above with desired rank
