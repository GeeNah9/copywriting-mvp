import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/authz";
import { getSupabaseAdmin } from "@/lib/supabase";

const schema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["editor", "admin"])
});

export async function GET() {
  try {
    await requireAdmin();
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("profiles").select("id,email,role,created_at").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const payload = schema.parse(await request.json());
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("profiles").upsert(payload).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
