-- Drop the problematic table and start fresh
DROP TABLE IF EXISTS authorized_admins CASCADE;

-- Create a clean, simple table
CREATE TABLE authorized_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add your email as the first admin
INSERT INTO authorized_admins (email, role)
VALUES ('hello@leoconsult.org', 'super_admin');

-- Verify it worked
SELECT * FROM authorized_admins;
