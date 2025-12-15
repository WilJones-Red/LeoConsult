-- Create the FAQ table for chatbot responses
CREATE TABLE IF NOT EXISTS public.faq_chatbot (
    id serial PRIMARY KEY,
    question text NOT NULL,
    answer text NOT NULL,
    tags text,
    locale text,
    last_updated date
);

-- Optional: Add RLS (Row Level Security)
ALTER TABLE public.faq_chatbot ENABLE ROW LEVEL SECURITY;

-- Example insert (repeat for each FAQ)
INSERT INTO public.faq_chatbot (question, answer, tags, locale, last_updated) VALUES
('What is Leo Consult?', 'Leo Consult is an AI–Data Analysis company providing data analytics, business consulting, and implementation support.', 'about,services,brand', 'US', '2025-08-01'),
('What services do you offer?', 'We offer Data Analytics, Business Consulting, and Implementation Support.', 'services', 'US', '2025-08-01'),
('How do I start a project with you?', 'Schedule a call at https://calendly.com/official-wilkinjones/30min or email official@wilkinjones.com. We’ll scope goals and data access, then provide next steps.', 'onboarding,contact,cta', 'US', '2025-08-01'),
('Do you offer a free consultation or audit?', 'Yes. We offer a free data audit that delivers 3–5 actionable insights tailored to your business.', 'data_audit,pricing,onboarding', 'US', '2025-08-01');
-- ...repeat for all FAQ rows from your CSV
