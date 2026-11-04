/**
 * Posts mostrados na aba "Activity" do mockup de LinkedIn (ver
 * LinkedInActivity.tsx) — mesmo padrão de PLACES/DEMO_PLACES do CozyMap e
 * PROJECTS/DEMO_PROJECTS do desktop POV (ver cozyPlaces.ts / projects.ts):
 *
 *  - POSTS       → conteúdo DEFINITIVO, da Jules. Vazio até ela passar os
 *                   posts reais (texto, imagem, nº de reações/comentários).
 *  - DEMO_POSTS  → exemplos só pra testar o carrossel — texto genérico,
 *                   sem nenhuma conquista/número inventado que pareça real.
 *                   Só aparecem em dev/preview (`HOTSPOT_DEBUG`), nunca em
 *                   produção, pelo mesmo motivo de `projects.ts`: aqui
 *                   "exemplo" significaria mostrar um post que a Jules
 *                   nunca fez.
 *
 * Pra publicar: preencha POSTS. Nada mais precisa mudar.
 */

import { HOTSPOT_DEBUG } from "@/components/RoomScene/debug";

export type LinkedInPost = {
  id: string;
  /** texto do post — a UI corta em ~4 linhas com "...mais" se for longo */
  text: string;
  /** imagem opcional do post */
  imageUrl?: string;
  imageAlt?: string;
  /** texto livre (o LinkedIn não mostra número exato, ex. "127") */
  reactions?: string;
  comments?: string;
  /** texto livre, tipo "2 sem" — não precisa ser uma data real */
  timeAgo?: string;
  /** true = exemplo de teste; nunca aparece em produção */
  demo?: boolean;
};

/* ───────────── CONTEÚDO DEFINITIVO (Jules) ───────────── */

export const POSTS: LinkedInPost[] = [];

/* ───────────── EXEMPLOS DE TESTE — nenhum post real ─────────────
   Só pra validar o carrossel (cartão, corte de texto, rolagem horizontal)
   antes dos posts reais chegarem. Texto deliberadamente genérico — nada
   que pareça uma conquista ou número real da Jules. */

const demo = (p: Omit<LinkedInPost, "demo">): LinkedInPost => ({ ...p, demo: true });

export const DEMO_POSTS: LinkedInPost[] = [
  demo({
    id: "demo-1",
    text: "Texto de exemplo do post — troca pelo texto real quando a Jules mandar. Serve só pra testar o corte em várias linhas e o botão “...mais”.",
    reactions: "12",
    comments: "3",
    timeAgo: "2 sem",
  }),
  demo({
    id: "demo-2",
    text: "Outro post de exemplo, mais curto, pra confirmar que o carrossel rola bem com cartões de tamanhos diferentes.",
    reactions: "4",
    comments: "0",
    timeAgo: "1 mês",
  }),
  demo({
    id: "demo-3",
    text: "Terceiro exemplo, com imagem — confirma que o cartão com foto fica do mesmo tamanho dos outros.",
    reactions: "8",
    comments: "1",
    timeAgo: "2 mês",
  }),
];

/** Lista que a interface usa: definitiva sempre; exemplos só em dev/preview. */
export const visiblePosts: LinkedInPost[] = HOTSPOT_DEBUG ? [...POSTS, ...DEMO_POSTS] : POSTS;

export const HAS_REAL_POSTS = POSTS.length > 0;
