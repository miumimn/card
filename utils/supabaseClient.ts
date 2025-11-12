import { createClient } from "@supabase/supabase-js";

// ✅ Your project URL and anon key from your Supabase dashboard
const supabaseUrl = "https://hhnkufngmgnzfzmlziqy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhobmt1Zm5nbWduemZ6bWx6aXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDI4ODMsImV4cCI6MjA3NzQxODg4M30.KiZjiWFfNjJhBG5amwpevwI0l7_GsThMyDT5fkCHZfU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
