"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [languages, setLanguages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/languages").then((r) => r.json()).then((p) => setLanguages(p.data ?? []));
    fetch("/api/admin/users", { headers: { "x-role": "admin" } })
      .then((r) => r.json())
      .then((p) => setUsers(p.data ?? []));
  }, []);

  return (
    <main>
      <h1>Admin Settings</h1>
      <div className="card">
        <h2>Languages</h2>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((l) => (
              <tr key={l.id}>
                <td>{l.code}</td>
                <td>{l.name}</td>
                <td>{String(l.is_active)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>Users / Roles</h2>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
