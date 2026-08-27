function getSupabaseUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return undefined;

  // Corrige URL colada com /rest/v1/ por engano
  return raw.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
}

/** Aceita anon (legado) ou publishable (chave nova do Supabase). */
function getSupabaseKey(): string | undefined {
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""
  ).trim();

  return key || undefined;
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
