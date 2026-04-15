export type AppRole = "editor" | "admin";

export type Feature = {
  id: string;
  name: string;
  slug: string;
};

export type Module = {
  id: string;
  feature_id: string;
  name: string;
  slug: string;
};

export type Language = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

export type StringItem = {
  id: string;
  module_id: string;
  key: string;
  default_language_code: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Translation = {
  id: string;
  string_id: string;
  language_id: string;
  value: string;
  updated_at: string;
  updated_by: string | null;
};
