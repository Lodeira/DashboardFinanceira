import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PublicSupabaseConfig } from "./config";

let client: SupabaseClient | null = null;
let configPromise: Promise<PublicSupabaseConfig> | null = null;

export async function fetchPublicConfig(): Promise<PublicSupabaseConfig> {
  if (!configPromise) {
    configPromise = fetch("/api/public-config", { cache: "no-store" })
      .then(async (res) => {
        const contentType = res.headers.get("content-type") ?? "";
        if (!res.ok || !contentType.includes("application/json")) {
          return { configured: false, url: null, key: null };
        }
        return (await res.json()) as PublicSupabaseConfig;
      })
      .catch(() => ({ configured: false, url: null, key: null }));
  }
  return configPromise;
}

export async function createClient() {
  if (client) return client;

  const config = await fetchPublicConfig();
  if (!config.configured || !config.url || !config.key) {
    throw new Error("Supabase não configurado");
  }

  client = createBrowserClient(config.url, config.key);
  return client;
}
