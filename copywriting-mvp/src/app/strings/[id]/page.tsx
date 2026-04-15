import { getSupabaseAdmin } from "@/lib/supabase";

export default async function StringDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("strings")
    .select("id,key,description,status,translations(value,languages(code,name))")
    .eq("id", id)
    .single();

  return (
    <main>
      <h1>{data?.key}</h1>
      <p>{data?.description}</p>
      <p>Status: {data?.status}</p>
      <div className="card">
        <h2>Translations</h2>
        <table>
          <thead>
            <tr>
              <th>Language</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {(data?.translations ?? []).map((t: any, index: number) => (
              <tr key={index}>
                <td>{t.languages?.name ?? t.languages?.code}</td>
                <td>{t.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
