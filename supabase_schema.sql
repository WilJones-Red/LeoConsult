-- ========================================
-- MIGRATION: Add Website Lead Columns
-- ========================================
-- Your table is currently set up for Instagram leads.
-- This adds all missing columns needed for website leads + leads.html dashboard

-- STEP 1: Clean up old Instagram-specific columns (OPTIONAL - uncomment if you want to remove them)
-- WARNING: This will delete the Instagram-specific columns and data
-- Uncomment the lines below ONLY if you want to remove Instagram columns

-- ALTER TABLE public.leads DROP COLUMN IF EXISTS ig_user_id;
-- ALTER TABLE public.leads DROP COLUMN IF EXISTS username;
-- ALTER TABLE public.leads DROP COLUMN IF EXISTS first_message;
-- ALTER TABLE public.leads DROP COLUMN IF EXISTS intent;
-- ALTER TABLE public.leads DROP COLUMN IF EXISTS last_status;

-- STEP 2: Add all missing columns needed for website contact form and leads.html
ALTER TABLE public.leads 
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS company_name TEXT,
    ADD COLUMN IF NOT EXISTS company_domain TEXT,
    ADD COLUMN IF NOT EXISTS company_industry TEXT,
    ADD COLUMN IF NOT EXISTS company_location TEXT,
    ADD COLUMN IF NOT EXISTS company_size TEXT,
    ADD COLUMN IF NOT EXISTS title TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
    ADD COLUMN IF NOT EXISTS source_page TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new',
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS decision_maker BOOLEAN,
    ADD COLUMN IF NOT EXISTS client_health TEXT,
    ADD COLUMN IF NOT EXISTS scope_pressure TEXT,
    ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tier TEXT,
    ADD COLUMN IF NOT EXISTS estimated_monthly_value NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS close_probability NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS next_action TEXT,
    ADD COLUMN IF NOT EXISTS next_action_date TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS metadata JSONB,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS calendly_booked BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS active_client BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Add unique constraint on email (for contact form upserts)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'leads_email_key'
    ) THEN
        ALTER TABLE public.leads ADD CONSTRAINT leads_email_key UNIQUE (email);
    END IF;
END $$;

-- Update source default from 'instagram' to allow NULL (so both can coexist)
ALTER TABLE public.leads ALTER COLUMN source DROP DEFAULT;
ALTER TABLE public.leads ALTER COLUMN source SET DEFAULT 'website';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public INSERT (for website contact form)
CREATE POLICY "Allow public insert" ON public.leads
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow authenticated users to SELECT/UPDATE/DELETE
CREATE POLICY "Allow authenticated users full access" ON public.leads
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.leads TO authenticated;
GRANT INSERT ON public.leads TO anon;
