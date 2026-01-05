-- Create a PostgreSQL function to get authorized admin emails
CREATE OR REPLACE FUNCTION get_authorized_admins()
RETURNS TABLE (email TEXT) 
LANGUAGE sql
AS $$
  SELECT email FROM authorized_admins;
$$;
