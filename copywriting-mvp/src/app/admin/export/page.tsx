"use client";

import { useState } from "react";

export default function ExportPage() {
  const [languageCodes, setLanguageCodes] = useState("en,zh-Hans");
  const [moduleIds, setModuleIds] = useState("");
  const [message, setMessage] = useState("");

  async function downloadExport() {
    const res = await fetch("/api/admin/export", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-role": "admin" },
      body: JSON.stringify({
        languageCodes: languageCodes.split(",").map((x) => x.trim()).filter(Boolean),
        moduleIds: moduleIds.split(",").map((x) => x.trim()).filter(Boolean)
      })
    });

    if (!res.ok) {
      const err = await res.json();
      setMessage(err.error ?? "Export failed");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "copywriting-export.zip";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Export generated.");
  }

  return (
    <main>
      <h1>Admin Export</h1>
      <p>Generate a zip with locales JSON files, export CSV, and a manifest.</p>
      <div className="card">
        <label>Language codes (comma separated)</label>
        <input value={languageCodes} onChange={(e) => setLanguageCodes(e.target.value)} />
        <label>Module IDs (optional, comma separated)</label>
        <input value={moduleIds} onChange={(e) => setModuleIds(e.target.value)} />
        <button onClick={() => void downloadExport()}>Download ZIP export</button>
      </div>
      {message ? <p>{message}</p> : null}
    </main>
  );
}
