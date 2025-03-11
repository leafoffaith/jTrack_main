// import { createClient } from "@supabase/supabase-js";

// export const supaClient = createClient(
//   "https://eychhasmtyfalzeuhrfz.supabase.co",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y2hoYXNtdHlmYWx6ZXVocmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA2MzM1MzcsImV4cCI6MjAwNjIwOTUzN30.gTbRgyH8mAFbTszOfmJi_2WqRajJ1iy970rbdimL2Q8"
// );

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase configuration. Check your environment variables."
  );
}

export const supaClient = createClient(supabaseUrl, supabaseKey);
