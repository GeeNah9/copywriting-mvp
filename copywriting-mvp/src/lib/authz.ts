import { headers } from "next/headers";

export async function getRequestRole() {
  const h = await headers();
  const role = h.get("x-role");
  if (role === "admin" || role === "editor") {
    return role;
  }
  return "anonymous";
}

export async function requireEditor() {
  const role = await getRequestRole();
  if (role !== "editor" && role !== "admin") {
    throw new Error("Editor or admin role required.");
  }
  return role;
}

export async function requireAdmin() {
  const role = await getRequestRole();
  if (role !== "admin") {
    throw new Error("Admin role required.");
  }
  return role;
}
