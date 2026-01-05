-- Check if authorized_admins table exists and has data
SELECT * FROM authorized_admins;

-- If the above returns nothing, run this to add your email:
-- INSERT INTO authorized_admins (email, role, is_active)
-- VALUES ('official@wilkinjones.com', 'super_admin', true);
