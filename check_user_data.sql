-- Check if your employee record has first_name populated
SELECT id, email, first_name, last_name, role, added_at
FROM public.employees
ORDER BY added_at DESC;
