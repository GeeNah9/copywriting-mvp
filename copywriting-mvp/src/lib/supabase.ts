import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnon) {
    throw new Error("Missing public Supabase environment variables.");
  }

  return createClient(supabaseUrl, supabaseAnon);
};

export const getSupabaseAdmin = () => {
  if (!supabaseUrl || !serviceRole) {
    throw new Error("Missing Supabase service role environment variables.");
  }

  return createClient(supabaseUrl, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
