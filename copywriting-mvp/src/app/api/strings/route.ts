import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireEditor } from "@/lib/authz";

const createStringSchema = z.object({
  module_id: z.string().uuid(),
  key: z.string().min(1),
  default_language_code: z.string().min(2),
  description: z.string().optional(),
  status: z.string().default("draft")
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const sb = getSupabaseAdmin();

  let req = sb
    .from("strings")
    .select("id,key,description,status,module_id,translations(value,languages(code))")
    .limit(200);

  if (q) {
    req = req.or(`key.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data, error } = await req;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    await requireEditor();
    const body = await request.json();
    const payload = createStringSchema.parse(body);
    const sb = getSupabaseAdmin();

    const { data, error } = await sb.from("strings").insert(payload).select("*").single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
