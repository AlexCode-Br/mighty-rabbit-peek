import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ijiipeugnflpckqsujkg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaWlwZXVnbmZscGNrcXN1amtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTQ2MDgsImV4cCI6MjA5NDg3MDYwOH0.zWQV8z2YVCA6H9S5DfqTX9tK2CF8_uH8_AaOzCXBt60";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);