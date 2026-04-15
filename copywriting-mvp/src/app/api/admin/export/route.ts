import AdmZip from "adm-zip";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const languageCodes: string[] = Array.isArray(body.languageCodes) ? body.languageCodes : [];
    const moduleIds: string[] = Array.isArray(body.moduleIds) ? body.moduleIds : [];

    const sb = getSupabaseAdmin();
    let langReq = sb.from("languages").select("id,code");
    if (languageCodes.length > 0) {
      langReq = langReq.in("code", languageCodes);
    }
    const { data: langs, error: langError } = await langReq;
    if (langError) throw langError;

    let stringsReq = sb.from("strings").select("id,key,module_id");
    if (moduleIds.length > 0) {
      stringsReq = stringsReq.in("module_id", moduleIds);
    }
    const { data: strings, error: stringsError } = await stringsReq;
    if (stringsError) throw stringsError;

    const stringIds = (strings ?? []).map((s) => s.id);
    const { data: translations, error: trError } = await sb
      .from("translations")
      .select("string_id,language_id,value")
      .in("string_id", stringIds.length ? stringIds : ["00000000-0000-0000-0000-000000000000"]);
    if (trError) throw trError;

    const zip = new AdmZip();
    const missing: Array<{ key: string; language: string }> = [];

    for (const lang of langs ?? []) {
      const map: Record<string, string> = {};
      for (const item of strings ?? []) {
        const t = (translations ?? []).find(
          (row) => row.string_id === item.id && row.language_id === lang.id
        );
        if (!t || !t.value) {
          missing.push({ key: item.key, language: lang.code });
          map[item.key] = "";
        } else {
          map[item.key] = t.value;
        }
      }
      zip.addFile(`locales/${lang.code}.json`, Buffer.from(JSON.stringify(map, null, 2), "utf8"));
    }

    const manifest = {
      exportedAt: new Date().toISOString(),
      filters: { languageCodes, moduleIds },
      counts: {
        languages: langs?.length ?? 0,
        strings: strings?.length ?? 0,
        missing: missing.length
      },
      missing
    };
    zip.addFile("meta/export-manifest.json", Buffer.from(JSON.stringify(manifest, null, 2), "utf8"));

    const csvHeader = ["key", ...(langs ?? []).map((l) => l.code)];
    const csvRows = (strings ?? []).map((s) => {
      const cols = (langs ?? []).map((l) => {
        const v = (translations ?? []).find((t) => t.string_id === s.id && t.language_id === l.id)?.value ?? "";
        return `"${v.replaceAll('"', '""')}"`;
      });
      return `"${s.key.replaceAll('"', '""')}",${cols.join(",")}`;
    });
    zip.addFile("export.csv", Buffer.from([csvHeader.join(","), ...csvRows].join("\n"), "utf8"));

    const data = zip.toBuffer();
    const filename = `export-${new Date().toISOString().replace(/[:.]/g, "-")}.zip`;
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
