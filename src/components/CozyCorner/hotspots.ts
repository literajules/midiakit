/**
 * Hotspots do cozy corner — adaptado do export de literajules-site
 * (CafeScene/hotspots.ts). Coordenadas em PORCENTAGEM DA IMAGEM ORIGINAL
 * (1670×942 — cafe-scene.webp), já medidas no site original, reaproveitadas
 * sem alteração.
 *
 * Máquina de café (breville), laptop e câmera DJI já têm experiência de
 * verdade (mapa, desktop e selfie redonda). Celular e fones ainda não —
 * `enabled: false` neles, aparecem só no modo de teste. Journal e óculos
 * ficaram de fora do plano do mídia kit (ver MIDIA-KIT-REUSO.md).
 */

import type { HotspotDef } from "../RoomScene/types";
import { HAS_REAL_PLACES } from "../CozyMap/cozyPlaces";

export const COZY_CORNER_HOTSPOTS: HotspotDef[] = [
  {
    id: "breville",
    label: "Máquina de café",
    destination: "Mapa de cafeterias favoritas",
    // reposicionado depois da foto nova (2026-11-09, "sunset v2"): a máquina
    // trocou de lado na nova composição (esquerda → direita, perto do
    // abajur) — remedido com grade de referência em cima da foto nova, não
    // é mais o mesmo ponto da foto anterior.
    cx: 72,
    cy: 24,
    w: 24,
    h: 32,
    enabled: HAS_REAL_PLACES,
  },
  {
    id: "laptop",
    label: "Laptop",
    destination: "Desktop interativo",
    cx: 52.4,
    cy: 57.1,
    w: 35.2,
    h: 45.1,
    enabled: true,
  },
  {
    id: "dji",
    label: "Câmera DJI",
    destination: "Selfie redonda com a câmera",
    cx: 81.9,
    cy: 64.9,
    w: 7,
    h: 29.3,
    enabled: true,
  },
  {
    id: "phone",
    label: "Celular",
    destination: "Ficha de contato",
    cx: 50.7,
    cy: 89.7,
    w: 10.9,
    h: 17.2,
  },
  {
    id: "earphones",
    label: "Fones",
    destination: "Playlist do Spotify",
    cx: 91.4,
    cy: 89.1,
    w: 13.9,
    h: 15.1,
    shape: "ellipse",
  },
];
