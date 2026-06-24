/// <reference types="vite/client" />

declare module "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm" {
  export function createClient(...args: unknown[]): unknown;
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly REACT_APP_GOOGLE_CLIENT_ID?: string;
}
