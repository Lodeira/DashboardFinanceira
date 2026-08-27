function normalizeUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  const url = raw.trim().replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
  return url || undefined;
}

function normalizeKey(raw?: string): string | undefined {
  const key = raw?.trim();
  return key || undefined;
}

export function getSupabaseUrl(): string | undefined {
  return normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

/** Aceita anon (legado) ou publishable (chave nova do Supabase). */
export function getSupabaseKey(): string | undefined {
  return normalizeKey(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  return Boolean(
    url &&
      key &&
      url.startsWith("https://") &&
      url.includes(".supabase.co") &&
      url !== "your-project-url" &&
      key !== "your-anon-key" &&
      key.length > 20
  );
}

/** Modo demonstração: dados mockados claramente identificados. */
export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}

export function getSupabaseEnv() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    throw new Error("Supabase não configurado");
  }

  return { url, key };
}

export type PublicSupabaseConfig = {
  configured: boolean;
  url: string | null;
  key: string | null;
};
