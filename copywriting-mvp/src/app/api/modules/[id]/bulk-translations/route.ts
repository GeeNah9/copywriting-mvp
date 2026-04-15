import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireEditor } from "@/lib/authz";

const bulkSchema = z.object({
  entries: z.array(
    z.object({
      string_id: z.string().uuid(),
      language_id: z.string().uuid(),
      value: z.string()
    })
  )
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = getSupabaseAdmin();
  const [{ data: strings }, { data: languages }, { data: translations }] = await Promise.all([
    sb.from("strings").select("id,key").eq("module_id", id).order("key"),
    sb.from("languages").select("id,code,name,is_active").eq("is_active", true).order("code"),
    sb
      .from("translations")
      .select("id,string_id,language_id,value")
      .in(
        "string_id",
        (
          await sb.from("strings").select("id").eq("module_id", id)
        ).data?.map((r) => r.id) ?? []
      )
  ]);

  return NextResponse.json({ strings: strings ?? [], languages: languages ?? [], translations: translations ?? [] });
}

export async function POST(request: Request) {
  try {
    await requireEditor();
    const sb = getSupabaseAdmin();
    const { entries } = bulkSchema.parse(await request.json());
    const { error } = await sb.from("translations").upsert(entries, {
      onConflict: "string_id,language_id"
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ updated: entries.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
