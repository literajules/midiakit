/**
 * Logos das marcas com quem a Jules já trabalhou — ícones fixos no canto
 * superior ESQUERDO do desktop (as pastas ficam no direito, ver
 * DesktopPOV.tsx). Clicar num logo abre a pasta "Entregas" já direto no
 * case daquela marca (`projectId`, casando com o `id` em `projects.ts`),
 * sem precisar navegar pela grade.
 *
 * Pra adicionar uma marca nova: 1) colar o logo em
 * `public/images/desktop/brands/<slug>.jpg` (ou .png); 2) acrescentar um
 * item aqui; 3) se já tiver um case correspondente em `projects.ts`, usar
 * o mesmo `id` como `projectId` (senão, deixar `projectId` de fora — o
 * ícone mostra "em breve" ao clicar, igual às pastas sem conteúdo).
 */

export type BrandLogoDef = {
  id: string;
  name: string;
  logoSrc: string;
  /** `id` do case em projects.ts que esse logo deve abrir — opcional */
  projectId?: string;
};

export const BRAND_LOGOS: BrandLogoDef[] = [
  { id: "maracugina", name: "Maracugina", logoSrc: "/images/desktop/brands/maracugina.jpg", projectId: "maracugina" },
  { id: "vinko", name: "Vinko", logoSrc: "/images/desktop/brands/vinko.png", projectId: "vinko" },
  { id: "oui-paris", name: "O.U.i Paris", logoSrc: "/images/desktop/brands/oui-paris.jpg", projectId: "oui-paris" },
];
