import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireEditor } from "@/lib/authz";

const upsertSchema = z.object({
  string_id: z.string().uuid(),
  language_id: z.string().uuid(),
  value: z.string()
});

export async function POST(request: Request) {
  try {
    await requireEditor();
    const payload = upsertSchema.parse(await request.json());
    const sb = getSupabaseAdmin();

    const { data: existing } = await sb
      .from("translations")
      .select("id,value")
      .eq("string_id", payload.string_id)
      .eq("language_id", payload.language_id)
      .maybeSingle();

    const { data, error } = await sb
      .from("translations")
      .upsert(payload, { onConflict: "string_id,language_id" })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (existing && existing.value !== payload.value) {
      await sb.from("string_history").insert({
        string_id: payload.string_id,
        language_id: payload.language_id,
        old_value: existing.value,
        new_value: payload.value
      });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
