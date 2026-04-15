# Copywriting Management MVP

MVP web app for APP copywriting management with:

- Public browse/search of strings.
- Editor/admin CRUD and bulk translation updates.
- Admin CSV import with report.
- Admin ZIP export (`locales/*.json`, `export.csv`, `meta/export-manifest.json`).
- Supabase schema with RLS for anonymous read and role-based write.

## 1) Setup

1. Copy `.env.example` to `.env.local` and fill Supabase keys.
2. Run SQL in `supabase/schema.sql` in your Supabase project.
3. Install and run:

```bash
npm install
npm run dev
```

## 2) Auth/Roles in MVP

Current UI/API uses `x-role` request header (`editor` or `admin`) as a temporary gate.
Replace this with Supabase Auth session checks and profile lookup before production.

## 3) CSV import format

Use columns:

- `feature`
- `module`
- `key`
- `description`
- one column per language code (`en`, `zh-Hans`, `ja`, etc.)

## 4) Export

Use Admin Export page to generate ZIP.

Manifest includes missing translations and export filters.