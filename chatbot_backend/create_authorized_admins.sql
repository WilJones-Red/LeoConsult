-- Create the authorized_admins table for managing admin access
CREATE TABLE IF NOT EXISTS authorized_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_authorized_admins_email ON authorized_admins(email);
CREATE INDEX IF NOT EXISTS idx_authorized_admins_is_active ON authorized_admins(is_active);

-- Add the primary admin (you)
INSERT INTO authorized_admins (email, role, is_active)
VALUES ('official@wilkinjones.com', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE authorized_admins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read authorized admins
CREATE POLICY "Allow authenticated users to read authorized_admins"
    ON authorized_admins
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authorized admins to insert new admins
CREATE POLICY "Allow authorized admins to insert new admins"
    ON authorized_admins
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM authorized_admins
            WHERE email = auth.jwt()->>'email'
            AND is_active = true
        )
    );

-- Create policy to allow authorized admins to update admins (but not themselves)
CREATE POLICY "Allow authorized admins to update other admins"
    ON authorized_admins
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM authorized_admins
            WHERE email = auth.jwt()->>'email'
            AND is_active = true
        )
    );

-- Create policy to allow authorized admins to delete other admins (but not themselves)
CREATE POLICY "Allow authorized admins to delete other admins"
    ON authorized_admins
    FOR DELETE
    TO authenticated
    USING (
        email != auth.jwt()->>'email'
        AND EXISTS (
            SELECT 1 FROM authorized_admins
            WHERE email = auth.jwt()->>'email'
            AND is_active = true
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_authorized_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_authorized_admins_updated_at
    BEFORE UPDATE ON authorized_admins
    FOR EACH ROW
    EXECUTE FUNCTION update_authorized_admins_updated_at();
