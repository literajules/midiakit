"use client";

import { useEffect, useRef, useState } from "react";
import SceneModal from "@/components/SceneModal/SceneModal";
import AboutMeWindow from "./AboutMeWindow";
import BrowserView from "./BrowserView";
import FolderWindow from "./FolderWindow";
import Dock from "./Dock";
import { BRAND_LOGOS, type BrandLogoDef } from "./brandLogos";
import { DESKTOP_FOLDERS, type DesktopFolderId } from "./folders";
import type { DockAppId } from "./dockApps";
import "./DesktopPOV.css";

type OriginPoint = { x: number; y: number };

type Props = {
  onClosed: () => void;
  /** centro do hotspot do laptop — a janela "nasce" literalmente dali (zoom
   * pra dentro da tela), em vez de crescer a partir do centro da tela. */
  originPoint?: OriginPoint | null;
  /** pasta já aberta ao montar — vinda do menu rápido (ver CozyCorner.tsx
   * `openFolder`), em vez de esperar o clique no ícone da pasta aqui dentro. */
  initialFolder?: DesktopFolderId | null;
};

/** itens decorativos da barra de menu (sem função — é só o visual do mockup).
 * Exportado pra reaproveitar na miniatura (MiniDesktopScreen.tsx) — mesma
 * lista nos dois, sem duplicar o array. */
export const MENU_ITEMS = ["File", "Edit", "View", "History", "Window"];

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/**
 * Relógio da barra de menu — só decorativo (bate hora local de quem
 * visita), atualiza a cada minuto. Sem risco de mismatch de hidratação:
 * o `DesktopPOV` só monta no cliente, dentro de um portal aberto por
 * clique (nunca é renderizado no servidor). Exportado pra reaproveitar
 * na miniatura (MiniDesktopScreen.tsx) — mesmo relógio de verdade, não
 * um texto estático.
 */
export function useMenubarClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${WEEKDAYS[now.getDay()]}. ${now.getDate()} ${MONTHS[now.getMonth()]} · ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// Exportados (junto com WifiMark/BatteryMark/FolderGlyph abaixo) pra
// reaproveitar na miniatura da tela do laptop (MiniDesktopScreen.tsx),
// sem duplicar os desenhos.
export function AppleMark() {
  return (
    <svg viewBox="0 0 14 16" width="11" height="13" fill="currentColor" aria-hidden="true">
      <path d="M11.2 8.4c0-1.6.8-2.5 2-3.2-.7-1-1.8-1.6-3.1-1.6-1 0-1.9.4-2.7.4-.8 0-1.8-.4-2.8-.4C2.4 3.6.6 5.4.6 8.4c0 2 1.1 5.4 2.9 7 .8.7 1.5 1.4 2.5 1.4.9 0 1.3-.6 2.4-.6s1.5.6 2.4.6c1 0 1.7-.8 2.5-1.5.6-.6 1-1.1 1.4-1.8-1.9-.9-2.5-2.6-2.5-4.3zM8.6 1.7c.6-.8 1.1-1.9 1-3-1 .1-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.5 2.8-1.4z" />
    </svg>
  );
}

export function WifiMark() {
  return (
    <svg viewBox="0 0 16 12" width="13" height="10" aria-hidden="true">
      <path d="M1 4.5a10 10 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3.3 7.2a6.5 6.5 0 0 1 9.4 0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="10" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function BatteryMark() {
  return (
    <svg viewBox="0 0 22 12" width="19" height="10" aria-hidden="true">
      <rect x="1" y="1.5" width="18" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2.5" y="3" width="13" height="6" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="20" y="4" width="1.6" height="4" rx="0.8" fill="currentColor" />
    </svg>
  );
}

/** ícone de pasta macOS — duas tonalidades de rosa (paleta do site: --pink) */
export function FolderGlyph() {
  return (
    <svg viewBox="0 0 48 40" width="38" height="32" aria-hidden="true">
      <path d="M2 8a3 3 0 0 1 3-3h12l4 5h22a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3Z" fill="#d98ba0" />
      <path d="M2 15h44v18a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3Z" fill="#e8aebb" />
    </svg>
  );
}

type WinId = "browser" | `folder-${DesktopFolderId}`;
type WinInstance =
  | { id: WinId; kind: "browser" }
  | {
      id: WinId;
      kind: "folder";
      folderId: DesktopFolderId;
      /** item pra já abrir selecionado (ver `handleBrandClick`) — entra na `key`
       * do React abaixo, pra forçar remontagem quando o foco muda. */
      focusItemId?: string;
    };

/** deslocamento inicial (px) de cada janela nova, pra não nascerem todas empilhadas no mesmo ponto */
function offsetFor(index: number) {
  const step = index % 4;
  return { x: step * 24 - 36, y: step * 18 - 27 };
}

/**
 * "POV do desktop" — aberto pelo hotspot do laptop no cozy corner (ou
 * direto numa pasta específica, pelo menu rápido — ver `initialFolder`
 * acima). Tela inteira (ver DesktopPOV.css): barra de menu no topo (visual
 * MacBook/macOS, só decorativa), o wallpaper (`desktop-wallpaper.png` — só
 * a foto, sem nada "assado" nela) cobrindo o palco de ponta a ponta, as
 * pastas no canto superior direito, a dock centrada embaixo, e por cima de
 * tudo as janelas abertas (navegador e pastas), cada uma arrastável e com
 * seu próprio z-index (clicar numa janela traz ela pra frente).
 */
export default function DesktopPOV({ onClosed, originPoint, initialFolder }: Props) {
  const clock = useMenubarClock();

  const [wins, setWins] = useState<WinInstance[]>(
    initialFolder ? [{ id: `folder-${initialFolder}`, kind: "folder", folderId: initialFolder }] : []
  );
  const [zOrder, setZOrder] = useState<WinId[]>(initialFolder ? [`folder-${initialFolder}`] : []);
  const [bouncingId, setBouncingId] = useState<DockAppId | null>(null);
  const [soonId, setSoonId] = useState<string | null>(null);
  const bounceTimer = useRef<number | null>(null);
  const soonTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (bounceTimer.current) window.clearTimeout(bounceTimer.current);
      if (soonTimer.current) window.clearTimeout(soonTimer.current);
    },
    []
  );

  const bounce = (id: DockAppId) => {
    setBouncingId(id);
    if (bounceTimer.current) window.clearTimeout(bounceTimer.current);
    bounceTimer.current = window.setTimeout(() => setBouncingId((cur) => (cur === id ? null : cur)), 420);
  };

  const showSoon = (id: string) => {
    setSoonId(id);
    if (soonTimer.current) window.clearTimeout(soonTimer.current);
    soonTimer.current = window.setTimeout(() => setSoonId((cur) => (cur === id ? null : cur)), 2200);
  };

  const openWindow = (win: WinInstance) => {
    setWins((cur) => (cur.some((w) => w.id === win.id) ? cur : [...cur, win]));
    setZOrder((cur) => [...cur.filter((id) => id !== win.id), win.id]);
  };
  const closeWindow = (id: WinId) => {
    setWins((cur) => cur.filter((w) => w.id !== id));
    setZOrder((cur) => cur.filter((x) => x !== id));
  };
  const focusWindow = (id: WinId) => {
    setZOrder((cur) => (cur[cur.length - 1] === id ? cur : [...cur.filter((x) => x !== id), id]));
  };

  // só o Chrome é clicável na dock agora (ver Dock.tsx) — este handler só
  // é mesmo chamado pra ele, mas mantém o `id` no parâmetro por clareza.
  const handleDockClick = (id: DockAppId) => {
    bounce(id);
    if (id === "chrome") openWindow({ id: "browser", kind: "browser" });
  };

  const handleFolderClick = (folderId: DesktopFolderId) => {
    openWindow({ id: `folder-${folderId}`, kind: "folder", folderId });
  };

  /** ícone de marca: abre "Entregas" já no case daquela marca. Substitui
   * (não só foca) uma janela de Entregas já aberta — senão, clicar num
   * logo diferente com a pasta já aberta só traria ela pra frente sem
   * trocar o case em exibição. Marcas sem `projectId` ainda (próprias que
   * a Jules for mandar) caem no aviso "em breve", igual aos apps da dock. */
  const handleBrandClick = (brand: BrandLogoDef) => {
    if (!brand.projectId) {
      showSoon(brand.id);
      return;
    }
    const id: WinId = "folder-projects";
    setWins((cur) => [...cur.filter((w) => w.id !== id), { id, kind: "folder", folderId: "projects", focusItemId: brand.projectId }]);
    setZOrder((cur) => [...cur.filter((x) => x !== id), id]);
  };

  const dockActiveIds: DockAppId[] = wins.some((w) => w.kind === "browser") ? ["chrome"] : [];

  return (
    <SceneModal
      onClosed={onClosed}
      dialogClassName="desktop-pov__dialog"
      overlayClassName="scene-modal--fullbleed"
      aria-labelledby="desktop-pov-title"
      originPoint={originPoint}
    >
      <h2 id="desktop-pov-title" className="sr-only">
        Desktop do laptop
      </h2>

      <div className="desktop-pov__frame">
        <div className="desktop-pov__menubar" aria-hidden="true">
          <span className="desktop-pov__menubar-apple">
            <AppleMark />
          </span>
          <span className="desktop-pov__menubar-app">Finder</span>
          {MENU_ITEMS.map((item) => (
            <span key={item} className="desktop-pov__menubar-item">
              {item}
            </span>
          ))}

          <div className="desktop-pov__menubar-status">
            <WifiMark />
            <BatteryMark />
            <span className="desktop-pov__menubar-clock">{clock}</span>
          </div>
        </div>

        <div className="desktop-pov__stage">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/desktop/desktop-wallpaper.png" alt="" draggable={false} className="desktop-pov__bg" />

          <div className="desktop-pov__folders">
            {DESKTOP_FOLDERS.map((folder) => (
              <button
                key={folder.id}
                type="button"
                className="desktop-pov__folder"
                onClick={() => handleFolderClick(folder.id)}
              >
                <FolderGlyph />
                <span className="desktop-pov__folder-label">{folder.label}</span>
              </button>
            ))}
          </div>

          {/* ——— logos das marcas, canto superior ESQUERDO (espelha as pastas
              à direita) — ver brandLogos.ts. ——— */}
          <div className="desktop-pov__brands">
            {BRAND_LOGOS.map((brand) => (
              <button key={brand.id} type="button" className="desktop-pov__brand" onClick={() => handleBrandClick(brand)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brand.logoSrc} alt="" className="desktop-pov__brand-logo" />
                <span className="desktop-pov__brand-label">{brand.name}</span>
              </button>
            ))}
          </div>

          {wins.map((win, i) => {
            const zIndex = 10 + zOrder.indexOf(win.id);
            const initialOffset = offsetFor(i);
            if (win.kind === "browser") {
              return (
                <BrowserView
                  key={win.id}
                  onClosed={() => closeWindow(win.id)}
                  onFocus={() => focusWindow(win.id)}
                  zIndex={zIndex}
                  initialOffset={initialOffset}
                />
              );
            }
            // "Sobre mim" (inspo) é uma página editorial fixa, não uma grade
            // de cases — vive no componente próprio AboutMeWindow (ver
            // comentário lá) em vez de mais um branch dentro do FolderWindow
            // genérico (pensado pra Entregas/Conteúdos).
            if (win.folderId === "inspo") {
              return (
                <AboutMeWindow
                  key={win.id}
                  onClose={() => closeWindow(win.id)}
                  onFocus={() => focusWindow(win.id)}
                  zIndex={zIndex}
                  initialOffset={initialOffset}
                />
              );
            }
            return (
              // a `key` inclui `focusItemId`: quando um ícone de marca pede outro
              // case com a janela já aberta, isso força remontar com o novo item
              // já selecionado (ver `initialSelectedId`, lido só na montagem).
              <FolderWindow
                key={`${win.id}-${win.focusItemId ?? ""}`}
                folderId={win.folderId}
                initialSelectedId={win.focusItemId}
                onClose={() => closeWindow(win.id)}
                onFocus={() => focusWindow(win.id)}
                zIndex={zIndex}
                initialOffset={initialOffset}
              />
            );
          })}

          <Dock activeIds={dockActiveIds} bouncingId={bouncingId} onAppClick={handleDockClick} />

          <p className={`desktop-pov__soon${soonId ? " is-on" : ""}`} role="status" aria-live="polite">
            em breve ✨
          </p>
        </div>
      </div>
    </SceneModal>
  );
}
