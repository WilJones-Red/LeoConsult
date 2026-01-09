-- ========================================
-- AUTO-SYNC: Create employees from auth users automatically
-- ========================================
-- This creates a trigger to automatically populate the employees table
-- when a new user is created in the auth system

-- Create function to auto-create employee record when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_rank TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    user_full_name TEXT;
BEGIN
    -- Get rank from user metadata
    user_rank := COALESCE(NEW.raw_user_meta_data->>'rank', 'employee');
    
    -- Try to get first/last name from metadata or email
    user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(split_part(NEW.email, '@', 1), '.', 1));
    user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(split_part(NEW.email, '@', 1), '.', 2));
    
    -- If last name is empty, try to extract from full name
    IF user_last_name = '' OR user_last_name IS NULL THEN
        user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
        IF user_full_name != '' THEN
            user_first_name := split_part(user_full_name, ' ', 1);
            user_last_name := split_part(user_full_name, ' ', 2);
        END IF;
    END IF;
    
    -- Capitalize first letter
    user_first_name := INITCAP(COALESCE(user_first_name, 'User'));
    user_last_name := INITCAP(COALESCE(NULLIF(user_last_name, ''), 'Employee'));
    
    -- Insert into employees table
    INSERT INTO public.employees (
        email,
        first_name,
        last_name,
        role,
        is_active
    )
    VALUES (
        NEW.email,
        user_first_name,
        user_last_name,
        user_rank,
        true
    )
    ON CONFLICT (email) DO UPDATE SET
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = timezone('utc'::text, now());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Also create trigger to sync when user metadata is updated
CREATE OR REPLACE FUNCTION public.handle_user_metadata_update()
RETURNS TRIGGER AS $$
DECLARE
    user_rank TEXT;
BEGIN
    -- Get rank from user metadata
    user_rank := COALESCE(NEW.raw_user_meta_data->>'rank', 'employee');
    
    -- Update employees table
    UPDATE public.employees
    SET 
        role = user_rank,
        updated_at = timezone('utc'::text, now())
    WHERE email = NEW.email;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE OF raw_user_meta_data ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_metadata_update();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON public.employees TO postgres, service_role;
GRANT SELECT ON public.employees TO authenticated;

-- Sync existing users (run this once to backfill)
INSERT INTO public.employees (email, first_name, last_name, role, is_active)
SELECT 
    u.email,
    INITCAP(COALESCE(
        u.raw_user_meta_data->>'first_name',
        split_part(split_part(u.email, '@', 1), '.', 1),
        'User'
    )) as first_name,
    INITCAP(COALESCE(
        u.raw_user_meta_data->>'last_name',
        NULLIF(split_part(split_part(u.email, '@', 1), '.', 2), ''),
        'Employee'
    )) as last_name,
    COALESCE(u.raw_user_meta_data->>'rank', 'employee') as role,
    true as is_active
FROM auth.users u
WHERE u.email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = timezone('utc'::text, now());
