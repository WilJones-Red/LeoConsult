-- ========================================
-- HELPER: Populate Employees Table from Auth Users
-- ========================================
-- This script helps you manually insert employees into the employees table
-- Replace the placeholder values with actual employee information

-- Insert current users from auth system
INSERT INTO public.employees (email, first_name, last_name, phone, role, is_active)
VALUES 
    ('i.a.gilson12@gmail.com', 'Isabella', 'Gilson', NULL, 'admin', true),
    ('hello@leoconsult.org', 'Wilkin', 'Jones', NULL, 'super_admin', true)
ON CONFLICT (email) DO NOTHING;

-- Query to see all employees
SELECT 
    id,
    first_name,
    last_name,
    email,
    role,
    is_active,
    created_at
FROM public.employees
ORDER BY first_name, last_name;

-- Query to see leads with assigned employees
SELECT 
    l.id,
    l.full_name as lead_name,
    l.company_name,
    l.status,
    e.first_name || ' ' || e.last_name as assigned_to,
    e.role as agent_role
FROM public.leads l
LEFT JOIN public.employees e ON l.assigned_employee_id = e.id
ORDER BY l.created_at DESC;
