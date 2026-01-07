-- Check what columns currently exist in your leads table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
ORDER BY ordinal_position;
