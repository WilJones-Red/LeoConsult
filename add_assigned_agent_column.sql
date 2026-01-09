-- ========================================
-- MIGRATION: Add Assigned Agent Column
-- ========================================
-- This adds the assigned_agent column to track which agent is handling each lead

ALTER TABLE public.leads 
    ADD COLUMN IF NOT EXISTS assigned_agent TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_assigned_agent ON public.leads(assigned_agent);

-- Add comment for documentation
COMMENT ON COLUMN public.leads.assigned_agent IS 'Email or name of the agent assigned to this lead';
