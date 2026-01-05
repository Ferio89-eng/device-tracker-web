import { createClient } from '@supabase/supabase-js';

// Credenziali Supabase corrette
const SUPABASE_URL = 'https://elsvmxktzsymdlmfhfcj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsc3ZteGt0enN5bWRsbWZoZmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjUwNTAsImV4cCI6MjA4MzIwMTA1MH0.CY1czMFydSt_inShcri7Qv-fcGCIRKZfR5LMuiEhgNI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);