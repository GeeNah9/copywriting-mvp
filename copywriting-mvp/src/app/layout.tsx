import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Copywriting Management MVP",
  description: "Manage app strings, translations, import, and export."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
