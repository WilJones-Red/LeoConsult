-- Check Ivana's user metadata in auth.users table
SELECT 
    id,
    email,
    raw_user_meta_data->>'rank' as metadata_rank,
    raw_user_meta_data,
    created_at,
    updated_at
FROM auth.users
WHERE email = 'i.a.gilson12@gmail.com';

-- Also check the employees table
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    added_at
FROM public.employees
WHERE email = 'i.a.gilson12@gmail.com';
