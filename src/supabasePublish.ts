import { decodeConfigFromHash, encodeConfigToHash } from "./siteConfigStorage";
import type { SiteConfig } from "./types";

type SupabaseClient = {
  from: (table: string) => {
    insert: (row: Record<string, unknown>) => {
      select: (columns?: string) => Promise<{
        data: Array<{ id: string }> | null;
        error: { message: string } | null;
      }>;
    };
  };
};

async function getSupabaseClient(): Promise<SupabaseClient> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  const { createClient } = await import(
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
  );

  return createClient(supabaseUrl, supabaseAnonKey) as SupabaseClient;
}

export function decodePublishedConfig(configOrHash: SiteConfig | string): SiteConfig {
  if (typeof configOrHash === "string") {
    const decoded = decodeConfigFromHash(
      configOrHash.startsWith("#cfg=") ? configOrHash : `#cfg=${configOrHash}`,
    );
    if (!decoded) {
      throw new Error("Unable to decode the site configuration.");
    }
    return decoded;
  }

  const roundTrip = decodeConfigFromHash(encodeConfigToHash(configOrHash));
  if (!roundTrip) {
    throw new Error("Unable to encode and decode the site configuration.");
  }
  return roundTrip;
}

export async function publishSiteToSupabase(config: SiteConfig): Promise<string> {
  const client = await getSupabaseClient();
  const siteData = decodePublishedConfig(config);

  const { data, error } = await client
    .from("hosted_sites")
    .insert({ site_data: siteData })
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  const id = data?.[0]?.id;
  if (!id) {
    throw new Error("Supabase did not return a published site ID.");
  }

  return `https://bobabiz.netlify.app/live.html?id=${encodeURIComponent(id)}`;
}
