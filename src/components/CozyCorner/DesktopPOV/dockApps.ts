/**
 * Apps da dock — dados puros. `chrome` é o ÚNICO clicável (abre o
 * `BrowserView`) e fica em evidência de propósito — saltita sozinho e
 * tem um brilho pulsando ao redor, pra chamar o clique (ver Dock.tsx/
 * Dock.css). Os demais são só cenário (sem botão, sem clique, um pouco
 * mais discretos) — a dock existe pra parecer um desktop de verdade, não
 * pra prometer app por app que ainda não existe.
 */

export type DockAppId =
  | "finder"
  | "safari"
  | "chrome"
  | "messages"
  | "mail"
  | "notes"
  | "photos"
  | "music"
  | "settings"
  | "trash";

export type DockAppDef = {
  id: DockAppId;
  label: string;
};

export const DOCK_APPS: DockAppDef[] = [
  { id: "finder", label: "Finder" },
  { id: "safari", label: "Safari" },
  { id: "chrome", label: "Google Chrome" },
  { id: "messages", label: "Mensagens" },
  { id: "mail", label: "Mail" },
  { id: "notes", label: "Notas" },
  { id: "photos", label: "Fotos" },
  { id: "music", label: "Música" },
  { id: "settings", label: "Preferências do Sistema" },
  { id: "trash", label: "Lixeira" },
];
