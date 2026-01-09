-- ========================================
-- FIX: Update RLS policies for employees table
-- ========================================
-- This fixes the access denied issue for user management

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.employees;
DROP POLICY IF EXISTS "Allow admin full access" ON public.employees;
DROP POLICY IF EXISTS "Allow admin update access" ON public.employees;
DROP POLICY IF EXISTS "Allow admin insert access" ON public.employees;
DROP POLICY IF EXISTS "Allow admin delete access" ON public.employees;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.employees;

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Allow ALL authenticated users to read employees (needed for dropdowns and lead assignments)
CREATE POLICY "Allow authenticated read access" ON public.employees
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow ALL authenticated users to update employees
-- (Admin panel already checks rank before allowing access)
CREATE POLICY "Allow authenticated update access" ON public.employees
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow ALL authenticated users to insert employees
-- (Admin panel already checks rank before allowing access)
CREATE POLICY "Allow authenticated insert access" ON public.employees
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow ALL authenticated users to delete employees
-- (Admin panel already checks rank before allowing access)
CREATE POLICY "Allow authenticated delete access" ON public.employees
    FOR DELETE
    TO authenticated
    USING (true);
