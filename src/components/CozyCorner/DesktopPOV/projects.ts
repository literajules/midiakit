/**
 * Cases de marca mostrados na pasta "Projects" do desktop POV.
 *
 * PROJECTS é o conteúdo definitivo, da Jules — os exemplos de teste
 * ("Marca Exemplo A/B", usados só pra validar o mecanismo antes dos cases
 * reais chegarem) já foram removidos, já que agora há cases reais pra
 * validar o mesmo layout (sidebar de favoritos, abas, página de case).
 *
 * Pra adicionar um novo case: só acrescentar um item em PROJECTS. Nada
 * mais precisa mudar.
 */

/**
 * Mesmo tipo é reaproveitado pela pasta "Conteúdos" (ver contentFormats.ts)
 * pros exemplos de formato de conteúdo — por isso `brand` é opcional: só
 * faz sentido pra parceria de marca (pasta "Entregas"), não pra um formato
 * que a Jules trabalha por conta própria (ex. "cozy lifestyle").
 */
export type ProjectCase = {
  id: string;
  /** nome da marca/parceria — opcional (pastas sem marca, ex. "Conteúdos", não usam) */
  brand?: string;
  /** título editorial da publi (ex. "Resenha de verão") — PENDENTE pros 3 cases reais */
  title?: string;
  /** formato da entrega (ex. "Reels", "Post", "Stories") — PENDENTE */
  format?: string;
  /** categoria de conteúdo (ex. "Lifestyle", "Home", "Beauty") — PENDENTE */
  category?: string;
  /** frase curta: o que foi essa colaboração (ex. "Reels de lançamento · verão 2025") —
   * opcional, só faz sentido pra parceria de marca */
  role?: string;
  /** descrição mais longa, 2–3 frases, na voz da Jules */
  description: string;
  /** imagem de capa do case — opcional; sem ela, mostra um bloco com a inicial da marca */
  imageUrl?: string;
  /** vídeo da entrega (o publi em si) — opcional; quando presente, substitui a
   * capa por um player com controles (ver FolderWindow.tsx) */
  videoUrl?: string;
  /**
   * Proporção REAL do vídeo (largura/altura do arquivo, lida direto do átomo
   * `tkhd` do mp4 — não é chute). A caixa de preview usa isso pra ter
   * exatamente o formato do vídeo (retrato/reels, nesses 3 casos) em vez de
   * uma caixa 16:9 que cortaria a maior parte dele. Sem isso, cai no 16:9.
   */
  videoAspect?: { w: number; h: number };
  /** prints de insights/comentários do post — opcional, mostrados numa galeria abaixo da descrição */
  insightImages?: { src: string; alt: string }[];
  /**
   * Números reais de um print de insights, "traduzidos" em chips estilo
   * site (não a UI escura do Instagram) — transcritos à mão do print, não
   * inventados. Mostrados junto dos `insightImages`, quando houver.
   */
  insightStats?: { label: string; value: string }[];
  /** link externo (post, site da marca...) — opcional */
  visitUrl?: string;
  visitLabel?: string;
  /** true = exemplo de teste; nunca aparece em produção */
  demo?: boolean;
};

/* ───────────── CONTEÚDO DEFINITIVO (Jules) ─────────────
   As 3 marcas abaixo já são parcerias reais e JÁ FORAM ENTREGUES pra cada
   marca — o vídeo em si está pronto e no ar (ver public/videos/projects/).
   O que falta é só o TEXTO deste site (o que foi pedido, formato, link,
   categoria) — por isso `role`/`description` continuam como estão até a
   Jules mandar esse texto. Sem selo de "rascunho": a entrega não é
   rascunho, só a descrição aqui no site é que está pendente. */

export const PROJECTS: ProjectCase[] = [
  {
    id: "oui-paris",
    brand: "O.U.i Paris",
    role: "Entrega em breve",
    description: "Case ainda no forno — falta só o texto (o que foi pedido, formato de entrega, link). O vídeo já está aqui.",
    videoUrl: "/videos/projects/oui-paris.mp4",
    videoAspect: { w: 480, h: 848 },
    // logo real da marca — mostrado no ícone da grade (sem aparecer como poster do vídeo)
    imageUrl: "/images/desktop/brands/oui-paris.jpg",
  },
  {
    id: "maracugina",
    brand: "Maracugina",
    role: "Entrega em breve",
    description: "Case ainda no forno — falta só o texto (o que foi pedido, formato de entrega, link). O vídeo já está aqui.",
    videoUrl: "/videos/projects/maracugina.mp4",
    videoAspect: { w: 720, h: 1280 },
    // logo real da marca — mostrado no ícone da grade (sem aparecer como poster do vídeo)
    imageUrl: "/images/desktop/brands/maracugina.jpg",
  },
  {
    id: "vinko",
    brand: "Vinko",
    role: "Entrega em breve",
    description: "Case ainda no forno — falta só o texto (o que foi pedido, formato de entrega, link). O vídeo já está aqui.",
    videoUrl: "/videos/projects/vinko.mp4",
    videoAspect: { w: 720, h: 1280 },
    // logo real da marca — mostrado no ícone da grade (letterboxed, não
    // esticado — `object-fit: contain` no FolderWindow.css); sem aparecer
    // como poster do vídeo
    imageUrl: "/images/desktop/brands/vinko.png",
    // print real de Insights do Instagram + os mesmos números, transcritos à mão (não inventados)
    insightImages: [{ src: "/images/desktop/projects/vinko-insights.png", alt: "Print dos Insights do Instagram da publi da Vinko" }],
    insightStats: [
      { label: "views", value: "10,2K" },
      { label: "likes", value: "522" },
      { label: "comentários", value: "30" },
      { label: "salvamentos", value: "99" },
      { label: "compartilhamentos", value: "88" },
    ],
  },
];

// Os exemplos de teste ("Marca Exemplo A/B") saíram: com 3 cases reais já
// validando o mecanismo (sidebar, abas, página de case), não precisava mais
// deles. `visibleProjects` existe só pra manter o nome que FolderWindow.tsx
// já importa — hoje é sempre igual a PROJECTS.
export const visibleProjects: ProjectCase[] = PROJECTS;

/** A pasta "Projects" só abre a experiência de verdade em produção quando há conteúdo real. */
export const HAS_REAL_PROJECTS = PROJECTS.length > 0;
