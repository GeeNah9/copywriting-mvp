import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/authz";
import { getSupabaseAdmin } from "@/lib/supabase";

const schema = z.object({
  code: z.string().min(2),
  name: z.string().min(1),
  is_active: z.boolean().default(true)
});

export async function GET() {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("languages").select("*").order("code");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const payload = schema.parse(await request.json());
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("languages").upsert(payload, { onConflict: "code" }).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
