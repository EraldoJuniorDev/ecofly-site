// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://euxlnqarxvbyaaqofyqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGxucWFyeHZieWFhcW9meXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NTYwNzgsImV4cCI6MjA3NTAzMjA3OH0.7wa3-BuE2uii4MM9cRfefDrhWgYtJpak0LII98ICjBg';

export const supabase = createClient(supabaseUrl, supabaseKey);