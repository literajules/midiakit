/**
 * Pastas do desktop — dados puros, sem React. A nova arte do wallpaper
 * (`desktop-wallpaper.png`) é só a foto/wallpaper, sem nenhum ícone
 * "assado" na imagem (ao contrário da versão anterior) — por isso as
 * pastas agora são elementos HTML de verdade, posicionados por nós (ver
 * DesktopPOV.css `.desktop-pov__folders`), em vez de hotspots invisíveis
 * tentando alinhar com pixels de uma arte estática.
 *
 * `projects` (label "Entregas") mostra os cases reais (ver `projects.ts`)
 * quando existem; `inspo` (label "Sobre mim") e `work` (label "Conteúdos"
 * — exemplos de post e categorias de conteúdo) ainda não têm conteúdo
 * definitivo da Jules — abrem a mesma `FolderWindow` com um estado vazio
 * ("em breve"), já pronta pra receber conteúdo depois, sem inventar nada
 * que ela não passou.
 */

export type DesktopFolderId = "projects" | "inspo" | "work";

export type DesktopFolderDef = {
  id: DesktopFolderId;
  label: string;
  /** mensagem do estado vazio, quando a pasta ainda não tem conteúdo definitivo */
  emptyHint: string;
};

export const DESKTOP_FOLDERS: DesktopFolderDef[] = [
  { id: "projects", label: "Entregas", emptyHint: "os cases de marca da Jules aparecem aqui — em breve." },
  { id: "inspo", label: "Sobre mim", emptyHint: "um pouco sobre a Jules — em breve." },
  { id: "work", label: "Conteúdos", emptyHint: "exemplos de posts e categorias de conteúdo — em breve." },
];
