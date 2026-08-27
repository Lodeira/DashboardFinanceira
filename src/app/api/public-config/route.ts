import { NextResponse } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Expõe URL + chave pública em runtime.
 * A publishable/anon key é feita para o browser — isso evita falha
 * quando NEXT_PUBLIC_* não entra no build da Vercel.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { configured: false, url: null, key: null },
      { status: 200 }
    );
  }

  const { url, key } = getSupabaseEnv();
  return NextResponse.json({ configured: true, url, key });
}
