import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";

export default async function ModulePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = getSupabaseAdmin();

  const [{ data: module }, { data: rows }] = await Promise.all([
    sb
      .from("modules")
      .select("id,name,features(name)")
      .eq("id", id)
      .single(),
    sb.from("strings").select("id,key,description,status").eq("module_id", id).order("key")
  ]);

  return (
    <main>
      <h1>Module: {module?.name}</h1>
      <p>Feature: {(module as any)?.features?.name ?? "-"}</p>
      <Link href="/editor">Open editor</Link>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row: any) => (
              <tr key={row.id}>
                <td>
                  <Link href={`/strings/${row.id}`}>{row.key}</Link>
                </td>
                <td>{row.description}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
