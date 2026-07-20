"use client";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xduywwgvgexbiggbuzgy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gY-7qPUilrY0c9i4mzHnPw_dZtjd1Ok";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
