"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Limpa SW antigo quebrado (causava erro de Response / rede no login)
    void (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch (err) {
        console.error("Falha ao limpar service workers antigos", err);
      }

      if (process.env.NODE_ENV !== "production") return;

      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (err) {
        console.error("Falha ao registrar service worker", err);
      }
    })();
  }, []);

  return null;
}
