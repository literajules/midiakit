/**
 * Modo de teste dos hotspots (marcadores visíveis + identificação do clique).
 *
 * Fica LIGADO em:
 *  - desenvolvimento local (`npm run dev`);
 *  - qualquer ambiente com NEXT_PUBLIC_HOTSPOT_DEBUG=true
 *    (na Vercel: Settings → Environment Variables → só no ambiente "Preview");
 *  - previews da Vercel, se "Automatically expose System Environment Variables"
 *    estiver ativo (NEXT_PUBLIC_VERCEL_ENV=preview).
 *
 * Fica DESLIGADO na versão pública (Production). As variáveis NEXT_PUBLIC_*
 * são trocadas pelo valor no momento do build.
 *
 * Reaproveitado de literajules-site (src/components/CafeScene/debug.ts) —
 * serve pra qualquer cena baseada em RoomScene (quarto, cozy corner, etc.).
 */
export const HOTSPOT_DEBUG =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_HOTSPOT_DEBUG === "true" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";
