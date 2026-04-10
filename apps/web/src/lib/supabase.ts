import { createClient } from "@supabase/supabase-js";

// We use ?? to provide fallback values during CI builds where
// .env.local does not exist. At runtime in the browser, the
// real values from .env.local are always used.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "placeholder";

export const supabase = createClient(supabaseUrl, supabaseKey);
