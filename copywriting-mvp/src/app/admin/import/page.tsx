"use client";

import { useState } from "react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");

  async function submit() {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/import", {
      method: "POST",
      headers: { "x-role": "admin" },
      body: form
    });
    const payload = await res.json();
    setResult(res.ok ? JSON.stringify(payload.report, null, 2) : payload.error ?? "Import failed");
  }

  return (
    <main>
      <h1>Admin CSV Import</h1>
      <p>Expected columns: feature, module, key, description, then language codes (en, zh-Hans, ...).</p>
      <div className="card">
        <input type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button onClick={() => void submit()} disabled={!file}>
          Import CSV
        </button>
      </div>
      {result ? (
        <div className="card">
          <pre>{result}</pre>
        </div>
      ) : null}
    </main>
  );
}
