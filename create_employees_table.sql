-- ========================================
-- MIGRATION: Create Employees Table
-- ========================================
-- Creates a proper employees table and links it to leads

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('employee', 'sales', 'staff', 'admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON public.employees(is_active);

-- Add RLS policies
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all employees (for dropdowns and assignments)
CREATE POLICY "Allow authenticated read access" ON public.employees
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow admins and super_admins to manage employees
CREATE POLICY "Allow admin full access" ON public.employees
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'rank' = 'admin' 
                 OR auth.users.raw_user_meta_data->>'rank' = 'super_admin')
        )
    );

-- Grant permissions
GRANT SELECT ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;

-- Add trigger for updated_at
CREATE TRIGGER set_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add new column to leads table for employee relationship
ALTER TABLE public.leads 
    ADD COLUMN IF NOT EXISTS assigned_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

-- Create index for foreign key
CREATE INDEX IF NOT EXISTS idx_leads_assigned_employee ON public.leads(assigned_employee_id);

-- Migrate existing assigned_agent data (optional - only if you have data)
-- This tries to match emails from assigned_agent to employees table
-- Uncomment if you want to migrate existing data after populating employees table:
-- UPDATE public.leads 
-- SET assigned_employee_id = employees.id
-- FROM public.employees
-- WHERE leads.assigned_agent = employees.email
-- AND leads.assigned_employee_id IS NULL;

-- You can optionally drop the old assigned_agent column after migration
-- Uncomment when ready:
-- ALTER TABLE public.leads DROP COLUMN IF EXISTS assigned_agent;

COMMENT ON TABLE public.employees IS 'Employee/agent information for assignment tracking';
COMMENT ON COLUMN public.employees.role IS 'Employee role: employee, sales, staff, admin, or super_admin';
COMMENT ON COLUMN public.leads.assigned_employee_id IS 'Foreign key to employees table for lead assignment';
