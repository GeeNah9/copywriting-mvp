import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireEditor } from "@/lib/authz";

const updateStringSchema = z.object({
  description: z.string().nullable().optional(),
  status: z.string().optional()
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("strings")
    .select("*,translations(id,language_id,value,updated_at,languages(code,name))")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireEditor();
    const { id } = await params;
    const body = await request.json();
    const patch = updateStringSchema.parse(body);
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("strings")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
