import { createClient } from '@supabase/supabase-js';

// Credentials for project: tpypdprmcodqyzrysvxi
const supabaseUrl = "https://tpypdprmcodqyzrysvxi.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRweXBkcHJtY29kcXl6cnlzdnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NTYzNzUsImV4cCI6MjA4NTQzMjM3NX0.BmeJsXIlNvyHhrvaW43QZVSEVcUu_ROvtX73EmkZdBk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);