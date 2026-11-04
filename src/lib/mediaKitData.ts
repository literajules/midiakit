/**
 * Dados do mídia kit "de bolso" (PDF) — fonte única pra não ter números
 * espalhados em dois lugares (site + PDF). Hoje os mesmos valores também
 * vivem hardcoded em `Quarto.tsx` (hotspots "mural"/"relógio") e
 * `FichaModal.tsx` (nichos/formatos); não movi esses componentes pra
 * importar daqui ainda (risco menor de conflito com edições em andamento
 * neles) — é um follow-up fácil se quiser essa centralização de verdade
 * no futuro: aí um número só muda aqui.
 */

export const MEDIA_KIT_DATA = {
  name: "Jules",
  handle: "@literajules",
  tagline: "romanticizing life while figuring it out",
  bio: "cozy living + everyday rituals",
  email: "literajules@gmail.com",
  link: "linktr.ee/literajules",

  /** mesmos números do hotspot "relógio" (Quarto.tsx) */
  stats: [
    { value: "19,9 mil", label: "seguidores no Instagram" },
    { value: "2,07 mi", label: "visualizações orgânicas em 30 dias" },
    { value: "90 mil", label: "interações nos últimos 30 dias" },
    { value: "+19,6%", label: "crescimento · +3.270 seguidores em 30 dias" },
  ],

  /** mesmos números do hotspot "mural" (Quarto.tsx) */
  audience: [
    { value: "96,9%", label: "público feminino" },
    { value: "76,4%", label: "entre 18 e 34 anos" },
    { value: "95,6%", label: "público no Brasil" },
  ],

  /** mesmas listas de FichaModal.tsx */
  niches: ["Autocuidado", "Rotina", "Moda", "Decor"],
  formats: ["Reels", "TikTok", "YouTube", "Stories", "UGC", "Evento ou viagem"],
};
