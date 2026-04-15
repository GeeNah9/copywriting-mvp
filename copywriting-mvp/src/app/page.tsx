import Link from "next/link";
import { listFeaturesWithModules, searchStrings } from "@/lib/data";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";
  const [features, strings] = await Promise.all([
    listFeaturesWithModules(),
    searchStrings(q)
  ]);

  return (
    <main>
      <h1>Copywriting Management</h1>
      <p>Public users can browse and copy strings. Editors/admins can manage content.</p>
      <div className="row" style={{ marginBottom: 16 }}>
        <Link href="/editor" className="card">
          Editor Dashboard
        </Link>
        <Link href="/admin/import" className="card">
          Admin Import
        </Link>
        <Link href="/admin/export" className="card">
          Admin Export
        </Link>
      </div>

      <div className="card">
        <form className="row">
          <input name="q" placeholder="Search key or description" defaultValue={q} />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="card">
        <h2>Features & Modules</h2>
        {features.map((feature: any) => (
          <div key={feature.id} style={{ marginBottom: 8 }}>
            <strong>{feature.name}</strong>
            <div className="row">
              {(feature.modules ?? []).map((mod: any) => (
                <Link key={mod.id} href={`/modules/${mod.id}`} className="card">
                  {mod.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Strings</h2>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Description</th>
              <th>Translations</th>
            </tr>
          </thead>
          <tbody>
            {strings.map((s: any) => (
              <tr key={s.id}>
                <td>
                  <Link href={`/strings/${s.id}`}>{s.key}</Link>
                </td>
                <td>{s.description}</td>
                <td>{(s.translations ?? []).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
