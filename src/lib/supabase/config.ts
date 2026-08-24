function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/** Aceita anon (legado) ou publishable (chave nova do Supabase). */
function getSupabaseKey(): string | undefined {
  return (
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
      url !== "your-project-url" &&
      key !== "your-anon-key" &&
      !url.includes("/rest/v1")
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
