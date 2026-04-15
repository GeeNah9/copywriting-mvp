import Papa from "papaparse";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { getSupabaseAdmin } from "@/lib/supabase";

type CsvRow = Record<string, string>;

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
    }

    const text = await file.text();
    const parse = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true });
    if (parse.errors.length > 0) {
      return NextResponse.json({ error: parse.errors[0].message }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    const report = { created: 0, updated: 0, conflicts: 0, missingKeys: 0 };

    for (const row of parse.data) {
      if (!row.key) {
        report.missingKeys += 1;
        continue;
      }

      const featureSlug = (row.feature ?? "general").toLowerCase().replace(/\s+/g, "-");
      const moduleSlug = (row.module ?? "default").toLowerCase().replace(/\s+/g, "-");

      const featureRes = await sb
        .from("features")
        .upsert({ name: row.feature ?? "General", slug: featureSlug }, { onConflict: "slug" })
        .select("id")
        .single();
      if (featureRes.error) {
        report.conflicts += 1;
        continue;
      }

      const moduleRes = await sb
        .from("modules")
        .upsert(
          { name: row.module ?? "Default", slug: moduleSlug, feature_id: featureRes.data.id },
          { onConflict: "feature_id,slug" }
        )
        .select("id")
        .single();
      if (moduleRes.error) {
        report.conflicts += 1;
        continue;
      }

      const stringRes = await sb
        .from("strings")
        .upsert(
          {
            module_id: moduleRes.data.id,
            key: row.key,
            description: row.description ?? null,
            default_language_code: "en"
          },
          { onConflict: "key" }
        )
        .select("id")
        .single();
      if (stringRes.error) {
        report.conflicts += 1;
        continue;
      }
      report.updated += 1;

      const { data: languages } = await sb.from("languages").select("id,code");
      for (const language of languages ?? []) {
        if (row[language.code] === undefined) continue;
        await sb.from("translations").upsert(
          {
            string_id: stringRes.data.id,
            language_id: language.id,
            value: row[language.code] ?? ""
          },
          { onConflict: "string_id,language_id" }
        );
      }
    }

    return NextResponse.json({ report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
