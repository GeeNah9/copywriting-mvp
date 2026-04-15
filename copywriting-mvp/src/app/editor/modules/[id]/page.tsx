"use client";

import { useEffect, useState } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

export default function BulkPage({ params }: Props) {
  const [moduleId, setModuleId] = useState("");
  const [strings, setStrings] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    params.then((p) => setModuleId(p.id));
  }, [params]);

  useEffect(() => {
    if (!moduleId) return;
    fetch(`/api/modules/${moduleId}/bulk-translations`)
      .then((r) => r.json())
      .then((payload) => {
        setStrings(payload.strings ?? []);
        setLanguages(payload.languages ?? []);
        const map: Record<string, string> = {};
        for (const t of payload.translations ?? []) {
          map[`${t.string_id}_${t.language_id}`] = t.value ?? "";
        }
        setValues(map);
      });
  }, [moduleId]);

  async function save() {
    const entries = Object.entries(values).map(([k, value]) => {
      const [string_id, language_id] = k.split("_");
      return { string_id, language_id, value };
    });
    const res = await fetch(`/api/modules/${moduleId}/bulk-translations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-role": "editor" },
      body: JSON.stringify({ entries })
    });
    const payload = await res.json();
    setMessage(res.ok ? `Saved ${payload.updated} entries` : payload.error ?? "Save failed");
  }

  return (
    <main>
      <h1>Bulk Translation Grid</h1>
      <p>Module: {moduleId}</p>
      <div className="card">
        <button onClick={() => void save()}>Save all translations</button>
        {message ? <p>{message}</p> : null}
        <table>
          <thead>
            <tr>
              <th>Key</th>
              {languages.map((l) => (
                <th key={l.id}>{l.code}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {strings.map((s) => (
              <tr key={s.id}>
                <td>{s.key}</td>
                {languages.map((l) => {
                  const key = `${s.id}_${l.id}`;
                  return (
                    <td key={key}>
                      <input
                        value={values[key] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
