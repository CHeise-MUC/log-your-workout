import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// A single Supabase client instance for the entire frontend.
// "!" tells TypeScript: this value definitely exists at runtime.
// The NEXT_PUBLIC_ prefix makes these env vars available in the browser.
export const supabase = createClient(supabaseUrl, supabaseKey);
