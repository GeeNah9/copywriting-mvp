"use client";

import { useEffect, useMemo, useState } from "react";

type StringRow = {
  id: string;
  key: string;
  description: string | null;
  status: string;
};

export default function EditorPage() {
  const [rows, setRows] = useState<StringRow[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return rows;
    return rows.filter((r) => r.key.toLowerCase().includes(n) || (r.description ?? "").toLowerCase().includes(n));
  }, [q, rows]);

  async function load() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/strings");
    const payload = await res.json();
    if (!res.ok) {
      setError(payload.error ?? "Failed to load");
      setLoading(false);
      return;
    }
    setRows(payload.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/strings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-role": "editor" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      setError("Update failed. Ensure role header/Auth is configured.");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  return (
    <main>
      <h1>Editor Dashboard</h1>
      <p>MVP note: API uses x-role header as a temporary role gate. Replace with Supabase Auth session checks.</p>
      <div className="card row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by key or description" />
        <button onClick={() => void load()} disabled={loading}>
          Reload
        </button>
      </div>
      {error ? <p>{error}</p> : null}
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
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{row.key}</td>
                <td>{row.description}</td>
                <td>
                  <select value={row.status} onChange={(e) => void updateStatus(row.id, e.target.value)}>
                    <option value="draft">draft</option>
                    <option value="reviewed">reviewed</option>
                    <option value="approved">approved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
