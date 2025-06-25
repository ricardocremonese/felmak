
import { createClient } from '@supabase/supabase-js';

// Define default Supabase URL and key in case environment variables are not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ewbkurucdynoypfkpemf.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Ymt1cnVjZHlub3lwZmtwZW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MDQyNzksImV4cCI6MjA1OTI4MDI3OX0.guIYzMO9fxJ-Ezd6RV8LC0U4ptGMbhmaqNU5Uysi-2M';

// Check if URLs are valid before initializing
if (!supabaseUrl.includes('supabase.co')) {
  console.error('Invalid or missing Supabase URL. Please set the VITE_SUPABASE_URL environment variable.');
}

// Initialize Supabase client with explicit URL and key
export const supabase = createClient(supabaseUrl, supabaseKey);
