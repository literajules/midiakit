/**
 * Hotspots do quarto — dados puros, sem React.
 *
 * Coordenadas em PORCENTAGEM DA IMAGEM ORIGINAL (1915×821 —
 * "bedroom-final.png", ver RoomScene/types.ts).
 *
 * Medidas a olho em cima da imagem final — dão pra calibrar com precisão
 * rodando `npm run dev` (modo de teste mostra o contorno pontilhado de cada
 * hotspot) e ajustando os números.
 *
 * `teaser`: texto do tooltip que o visitante vê de verdade (hover/foco) —
 * o que aquele clique REVELA, não o nome do objeto (ver RoomScene/types.ts
 * e a conversa "ajustes no quarto" — antes o tooltip mostrava `label`,
 * tipo "Telefone"; agora mostra isso aqui).
 */

import type { HotspotDef } from "../RoomScene/types";

export const QUARTO_HOTSPOTS: HotspotDef[] = [
  {
    id: "telefone",
    label: "Telefone",
    destination: "Ficha de contato para marcas",
    teaser: "contato",
    cx: 13.4,
    cy: 64.6,
    w: 7.6,
    h: 17.1,
    enabled: true,
  },
  {
    id: "toca-discos",
    label: "Toca-discos",
    destination: "Playlist do Spotify",
    teaser: "my jams",
    cx: 24.2,
    cy: 46.3,
    w: 8.6,
    h: 12.2,
    enabled: true,
  },
  {
    id: "mural",
    label: "Quadro de recados",
    destination: "Métricas de público",
    teaser: "público",
    cx: 93,
    cy: 24.1,
    w: 13.1,
    h: 32.3,
    enabled: true,
  },
  {
    id: "relogio",
    label: "Relógio de gato",
    destination: "Métricas e números",
    teaser: "números",
    cx: 32,
    cy: 21,
    w: 5,
    h: 18.9,
    enabled: true,
  },
  {
    id: "interruptor",
    label: "Interruptor",
    destination: "Acender/apagar a luz aconchegante",
    teaser: "luz",
    cx: 37.2,
    cy: 47.2,
    w: 1.5,
    h: 5.5,
    enabled: true,
  },
  {
    id: "porta",
    label: "Porta",
    destination: "Sair para o cozy corner",
    teaser: "cozy corner",
    cx: 81,
    cy: 34.7,
    w: 7.3,
    h: 67,
    enabled: true,
  },
  {
    id: "livro",
    label: "Livro",
    destination: "Recibo — o que tá rolando por aqui",
    teaser: "updates",
    cx: 54.4,
    cy: 60.6,
    w: 6,
    h: 5.5,
    enabled: true,
  },
];
