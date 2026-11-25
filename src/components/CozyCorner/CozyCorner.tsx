"use client";

import { useLanguage } from "@/components/Language";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import RoomScene from "@/components/RoomScene/RoomScene";
import type { HotspotDef } from "@/components/RoomScene/types";
import BackArrow from "./BackArrow";
import DesktopPOV from "./DesktopPOV/DesktopPOV";
import MiniDesktopScreen from "./DesktopPOV/MiniDesktopScreen";
import DjiPhotobooth from "./DjiPhotobooth";
import Guestbook from "./Guestbook";
import { COZY_CORNER_HOTSPOTS } from "./hotspots";
import "./CozyCorner.css";

const CAFE_SCENE_WIDTH = 1672;
const CAFE_SCENE_HEIGHT = 941;

// Limites internos do vidro na foto, em pixels. A conversão mantém a
// barra junto ao topo da tela em qualquer enquadramento da cena.
function screenPoint(x: number, y: number) {
  return { x: (x / CAFE_SCENE_WIDTH) * 100, y: (y / CAFE_SCENE_HEIGHT) * 100 };
}

const LAPTOP_SCREEN_CORNERS = {
  tl: screenPoint(642.5, 336),
  tr: screenPoint(1103, 336),
  br: screenPoint(1109.5, 592),
  bl: screenPoint(637, 592),
};

// Ponto de origem do vapor, em porcentagem da foto atual.
const STEAM_POS = { left: 72, top: 10 };

// o mapa (e o MapLibre) só é baixado quando alguém clica na máquina de café.
const CozyMapModal = dynamic(() => import("@/components/CozyMap/CozyMapModal"), { ssr: false });

type OriginPoint = { x: number; y: number };

function centerOf(el: HTMLElement): OriginPoint {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Ponto focal do recorte "cover" do cozy corner (ver RoomScene/layout.ts).
 *
 * `cafe-scene.webp` é 1670×942 (1,77:1) — bem mais próxima das telas
 * comuns que a do quarto (1920×1080 é 1,78:1, 1366×768 é 1,78:1): nessas
 * duas o corte horizontal é praticamente zero. `focalX = 0.524` é o centro
 * do laptop (hotspot `laptop`, cx 52,4%, prioridade 1 — "completo e
 * centralizado"), não o centro geométrico da foto — a diferença dos dois é
 * pequena aqui, mas é ela que garante o laptop sempre centralizado de
 * verdade, em vez de culpa de um "center center" genérico.
 *
 * Em telas estreitas, a foto pode ser explorada horizontalmente.
 */
const GUESTBOOK_PREVIEW = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";
const COZY_CORNER_LAYOUT = { focalX: 0.524, panTrigger: 0.75 };
const hotspots: HotspotDef[] = GUESTBOOK_PREVIEW ? [
  ...COZY_CORNER_HOTSPOTS,
  { id: "guestbook", label: "Caderno", destination: "Livro de visitas", teaser: "meu journal", cx: 16.6, cy: 82.5, w: 28, h: 20, enabled: true },
] : COZY_CORNER_HOTSPOTS;

/**
 * Cena 2 — o cozy corner (cafeteria). Reaproveitada do `literajules-site`
 * via `cozy-corner-export` — mesma foto, mesmas 5 coordenadas de hotspot
 * medidas no site original (journal/óculos ficaram fora do plano, ver
 * MIDIA-KIT-REUSO.md), agora rodando no `RoomScene` genérico deste projeto
 * em vez do `CafeScene` original (evita duplicar o sistema de quadro/hotspot
 * que já existe aqui).
 *
 * Máquina de café, laptop e câmera DJI abrem algo de verdade (Cozy Map,
 * desktop interativo e selfie redonda). Celular e fones ainda não têm a
 * experiência construída — ficam com `enabled: false`, combinado no export.
 *
 * `onBackClick`: seta fixa no canto esquerdo (`BackArrow`) que avisa o pai
 * (Site.tsx) que o visitante quer voltar pro quarto — mesmo padrão do
 * `onDoorClick` do Quarto: esta cena só avisa, quem decide a transição de
 * verdade é o pai.
 *
 * Sem scroll-section depois desta cena (o antigo "capítulo 3" /
 * scrollytelling foi removido — ver NOTES-conceito-scrollytelling.md na
 * raiz do workspace pra reaproveitar o conceito em outro lugar do site).
 * O cozy corner ocupa só a própria tela, igual ao quarto.
 *
 * `openFolder`/`onOpenFolderHandled`: abertura EXTERNA de uma pasta do
 * laptop pelo menu rápido (`QuickNav`/`Site.tsx` — "Conteúdos"/"Entregas"),
 * sem precisar clicar no hotspot do laptop na foto. Mesmo padrão do
 * `openNote` do Quarto: como não veio de um clique na foto, abre sem
 * zoom-a-partir-do-objeto (`origin: null`) e já com a pasta certa aberta
 * por dentro (`initialFolder`, ver DesktopPOV.tsx).
 */
export default function CozyCorner({
  onBackClick,
  onOpenScrapbook,
  openFolder,
  onOpenFolderHandled,
}: {
  onBackClick: () => void;
  onOpenScrapbook: () => void;
  openFolder?: "work" | "projects" | null;
  onOpenFolderHandled?: () => void;
}) {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [initialFolder, setInitialFolder] = useState<"work" | "projects" | null>(null);
  const [djiOpen, setDjiOpen] = useState(false);
  const [guestbook, setGuestbook] = useState<{ selfie: string | null } | null>(null);
  const [origin, setOrigin] = useState<OriginPoint | null>(null);

  const [steamOn, setSteamOn] = useState(false);

  // abertura externa (menu rápido) — ver doc da prop acima. setState dentro
  // do callback do rAF (não direto no corpo do efeito), mesmo motivo do
  // Quarto.tsx `openNote`.
  useEffect(() => {
    if (!openFolder) return;
    const raf = requestAnimationFrame(() => {
      setOrigin(null);
      setInitialFolder(openFolder);
      setDesktopOpen(true);
      onOpenFolderHandled?.();
    });
    return () => cancelAnimationFrame(raf);
  }, [openFolder, onOpenFolderHandled]);

  const handleActivate = (def: HotspotDef, el: HTMLButtonElement) => {
    setActiveId(def.id);
    if (def.id === "breville") {
      setMapOpen(true);
      return;
    }
    if (def.id === "laptop") {
      setOrigin(centerOf(el));
      setInitialFolder(null); // clique direto no laptop: abre no desktop, sem pasta pré-aberta
      setDesktopOpen(true);
      return;
    }
    if (def.id === "guestbook") {
      setGuestbook({ selfie: null });
      return;
    }
    if (def.id === "dji") {
      setOrigin(centerOf(el));
      setDjiOpen(true);
      return;
    }
    window.setTimeout(() => setActiveId((cur) => (cur === def.id ? null : cur)), 1200);
  };

  const handleHover = (id: string, hovering: boolean) => {
    if (id === "breville") setSteamOn(hovering);
  };

  return (
    <>
      <RoomScene
        id="cozy-corner"
        ariaLabel={t("A cafeteria", "The café")}
        sceneW={CAFE_SCENE_WIDTH}
        sceneH={CAFE_SCENE_HEIGHT}
        imageSrc="/images/cafe/cafe-scene.webp"
        imageAlt="Mesa de madeira numa cafeteria ao lado da janela: MacBook aberto no centro, café gelado com chantilly, caderno aberto, máquina de café Breville ao fundo, câmera DJI, recibo da cafeteria, fones de ouvido e um abajur aceso."
        hotspots={hotspots}
        onActivate={handleActivate}
        activeId={activeId}
        onHotspotHover={handleHover}
        background="var(--cream)"
        revealOnScroll={false}
        layoutOptions={COZY_CORNER_LAYOUT}
        showPanArrows
      >
        {/* ——— miniatura do desktop, projetada na tela do laptop (ver
            MiniDesktopScreen.tsx) — só decoração, por baixo do hotspot
            `laptop` de verdade (que continua abrindo o DesktopPOV de tela
            cheia no clique). ——— */}
        <MiniDesktopScreen corners={LAPTOP_SCREEN_CORNERS} />
        <div className="cozy-window-leaves" aria-hidden="true">
          <span className="cozy-window-leaf" />
          <span className="cozy-window-leaf" />
          <span className="cozy-window-leaf" />
        </div>

        {/* ——— máquina de café: vapor sobe enquanto o mouse está no
            hotspot `breville` (sem som, a pedido — clique continua
            abrindo o mapa de cafeterias, normalmente — ver handleActivate) ——— */}
        <div
          className={`cozy-steam${steamOn ? " is-on" : ""}`}
          aria-hidden="true"
          style={{ left: `${STEAM_POS.left}%`, top: `${STEAM_POS.top}%` }}
        >
          <span className="cozy-steam__wisp cozy-steam__wisp--1" />
          <span className="cozy-steam__wisp cozy-steam__wisp--2" />
          <span className="cozy-steam__wisp cozy-steam__wisp--3" />
        </div>
      </RoomScene>

      <BackArrow onClick={onBackClick} />

      {mapOpen && <CozyMapModal onClosed={() => setMapOpen(false)} />}
      {desktopOpen && (
        <DesktopPOV
          onClosed={() => {
            setDesktopOpen(false);
            setInitialFolder(null);
          }}
          originPoint={origin}
          initialFolder={initialFolder}
          onOpenScrapbook={onOpenScrapbook}
        />
      )}
      {djiOpen && <DjiPhotobooth onClosed={() => setDjiOpen(false)} originPoint={origin}
        onJournal={GUESTBOOK_PREVIEW ? (selfie) => { setDjiOpen(false); setGuestbook({ selfie }); } : undefined} />}
      {guestbook && <Guestbook selfie={guestbook.selfie} onClosed={() => setGuestbook(null)} />}
    </>
  );
}
