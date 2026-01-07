// Supabase Configuration
// Get these values from your Supabase project dashboard: Settings > API

const SUPABASE_CONFIG = {
    url: 'https://clpcskkoguomoihnisai.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscGNza2tvZ3VvbW9paG5pc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjYyMTIsImV4cCI6MjA3MDgwMjIxMn0.TpZQuKm0cVvl7lJbXt2Iw1_s3HlLLIIbRr7lIOyVsBo'
};

// Initialize Supabase client (using the library loaded from CDN)
const supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
