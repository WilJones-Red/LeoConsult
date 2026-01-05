-- Temporarily disable RLS to fix the slow query issue
ALTER TABLE authorized_admins DISABLE ROW LEVEL SECURITY;

-- Verify your data is there
SELECT * FROM authorized_admins;
