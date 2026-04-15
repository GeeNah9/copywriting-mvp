import { getSupabaseAdmin } from "@/lib/supabase";

export async function searchStrings(query: string) {
  const sb = getSupabaseAdmin();
  const normalized = query.trim();

  let request = sb
    .from("strings")
    .select("id,key,description,status,module_id,translations(value,languages(code,name))")
    .limit(200);

  if (normalized) {
    request = request.or(`key.ilike.%${normalized}%,description.ilike.%${normalized}%`);
  }

  const { data, error } = await request;
  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function listFeaturesWithModules() {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("features")
    .select("id,name,slug,modules(id,name,slug)")
    .order("name");

  if (error) {
    throw error;
  }
  return data ?? [];
}
