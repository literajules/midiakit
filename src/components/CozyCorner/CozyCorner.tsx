"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import RoomScene from "@/components/RoomScene/RoomScene";
import type { HotspotDef } from "@/components/RoomScene/types";
import BackArrow from "./BackArrow";
import DesktopPOV from "./DesktopPOV/DesktopPOV";
import MiniDesktopScreen from "./DesktopPOV/MiniDesktopScreen";
import DjiPhotobooth from "./DjiPhotobooth";
import { COZY_CORNER_HOTSPOTS } from "./hotspots";
import "./CozyCorner.css";

/**
 * Os 4 cantos da TELA do laptop (não a moldura/teclado — só o retângulo
 * de vidro, por DENTRO do bisel preto) dentro da foto `cafe-scene.webp`
 * (1672×941), em % da cena. Medidos com grades de referência finas
 * (passo de 5px) nos 4 lados separadamente + 3px de margem pra dentro em
 * cada canto — garante que a miniatura nunca vaze pro bisel preto mesmo
 * com um resto pequeno de imprecisão de medida.
 *
 * 2ª rodada de medição (ver conversa "ícones das marcas ultrapassando a
 * tela"): a 1ª medida da borda ESQUERDA tinha pego a borda do CHASSI de
 * alumínio (a moldura metálica fora da tela), não a borda real do vidro
 * depois do bisel preto — erro de ~23px, bem maior que a margem de 3px
 * prevista, por isso os logos de marca (perto da borda esquerda da
 * miniatura) e a maçã da barra de menu vazavam visivelmente. Medido de
 * novo com uma grade separada pra cada lado (esquerda/direita/cima/baixo)
 * em vez de uma grade só cobrindo tudo de uma vez, pra não repetir esse
 * erro de "qual bisel é esse".
 *
 * Alimenta a `MiniDesktopScreen` (réplica em miniatura do desktop,
 * projetada com a perspectiva real da foto — ver lib/cornerPin.ts).
 */
const LAPTOP_SCREEN_CORNERS = {
  tl: { x: 38.94, y: 36.13 },
  tr: { x: 65.43, y: 35.92 },
  br: { x: 65.31, y: 61.11 },
  bl: { x: 38.82, y: 61.11 },
};

/**
 * Caixas (em % da imagem original, 1670×942 — mesma convenção dos
 * hotspots) dos efeitos de hover ambiente pedidos pela Jules:
 *  - `DRINK_ZONE`: café gelado — o copo balança levemente (ver
 *    sway-drink.png, recorte com borda emplumada da própria foto).
 *  - `STEAM_POS`: ponto de onde sobe o vapor da máquina (breville) —
 *    hotspot de verdade, não precisa de zona própria.
 * Café não é hotspot (não abre nada): zona de hover "muda" desenhada como
 * `children` do RoomScene, sem o `+`/tooltip dos hotspots de verdade.
 *
 * O caderno ("escrevendo minha própria história...") usava um retalho
 * cobrindo a tinta da foto + texto redesenhado em código por cima — o
 * retalho aparecia como uma mancha por cima da mesa, em vez de parecer
 * papel de verdade. Removido: a foto original já tem esse texto escrito à
 * mão, legível sem nenhuma camada por cima — ver conversa "remover o blur
 * do caderno".
 */
// reposicionados depois da foto nova (2026-11-09, "sunset v2"): o drink e a
// máquina de café trocaram de lado na nova composição (antes à esquerda do
// laptop, agora à direita, perto do abajur/DJI) — remedido com grade de
// referência em cima da foto nova, não é mais o mesmo ponto da foto anterior.
const DRINK_ZONE = { cx: 74, cy: 50, w: 16, h: 46 };
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
 * Única faixa testada em que o laptop não cabe 100% inteiro: celular em pé
 * (390×844 → só 26,1% da largura original visível, contra os 35,2% que o
 * laptop ocupa) — corta ~13% de cada borda externa dele (o teclado/dobradiça
 * nas pontas), mas a tela do MacBook, mais central, continua inteira.
 * `panTrigger = 0.2` deixa essa faixa em "cover" mesmo assim (a perda é bem
 * menor que a do quarto nessa mesma faixa) — serve só de rede de segurança
 * pra proporções mais extremas que as testadas.
 */
const COZY_CORNER_LAYOUT = { focalX: 0.524, panTrigger: 0.2 };

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
  openFolder,
  onOpenFolderHandled,
}: {
  onBackClick: () => void;
  openFolder?: "work" | "projects" | null;
  onOpenFolderHandled?: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [initialFolder, setInitialFolder] = useState<"work" | "projects" | null>(null);
  const [djiOpen, setDjiOpen] = useState(false);
  const [origin, setOrigin] = useState<OriginPoint | null>(null);

  // hover ambiente (copo, vapor da máquina) — "breville" chega daqui via
  // `onHotspotHover` (hotspot de verdade); "drink" vem da zona muda
  // desenhada como children do RoomScene (ver abaixo).
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    if (def.id === "dji") {
      setOrigin(centerOf(el));
      setDjiOpen(true);
      return;
    }
    window.setTimeout(() => setActiveId((cur) => (cur === def.id ? null : cur)), 1200);
  };

  // hover de um hotspot de verdade (`breville`, pro vapor subir — ver
  // `.cozy-steam` abaixo, SEM som, a pedido) + da zona muda do copo (mesma
  // assinatura, pra reaproveitar no onPointerEnter/Leave dela).
  const handleHover = (id: string, hovering: boolean) => {
    setHoveredId(hovering ? id : null);
  };

  return (
    <>
      <RoomScene
        id="cozy-corner"
        ariaLabel="A cafeteria"
        sceneW={1672}
        sceneH={941}
        imageSrc="/images/cafe/cafe-scene.webp"
        imageAlt="Mesa de madeira numa cafeteria ao lado da janela: MacBook aberto no centro, café gelado com chantilly, caderno aberto, máquina de café Breville ao fundo, câmera DJI, recibo da cafeteria, fones de ouvido e um abajur aceso."
        hotspots={COZY_CORNER_HOTSPOTS}
        onActivate={handleActivate}
        activeId={activeId}
        onHotspotHover={handleHover}
        background="var(--cream)"
        revealOnScroll={false}
        layoutOptions={COZY_CORNER_LAYOUT}
      >
        {/* ——— café gelado: copo + chantilly + canudo balançam juntos no
            hover (ver sway-drink.png e o comentário em CozyCorner.css) ——— */}
        <div
          className="cozy-drink-wrap"
          style={{
            left: `${DRINK_ZONE.cx}%`,
            top: `${DRINK_ZONE.cy}%`,
            width: `${DRINK_ZONE.w}%`,
            height: `${DRINK_ZONE.h}%`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cafe/sway-drink.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`cozy-drink${hoveredId === "drink" ? " is-on" : ""}`}
          />
        </div>
        <div
          className="cozy-fx-zone"
          aria-hidden="true"
          style={{
            left: `${DRINK_ZONE.cx}%`,
            top: `${DRINK_ZONE.cy}%`,
            width: `${DRINK_ZONE.w}%`,
            height: `${DRINK_ZONE.h}%`,
          }}
          onPointerEnter={() => handleHover("drink", true)}
          onPointerLeave={() => handleHover("drink", false)}
        />

        {/* ——— miniatura do desktop, projetada na tela do laptop (ver
            MiniDesktopScreen.tsx) — só decoração, por baixo do hotspot
            `laptop` de verdade (que continua abrindo o DesktopPOV de tela
            cheia no clique). ——— */}
        <MiniDesktopScreen corners={LAPTOP_SCREEN_CORNERS} />

        {/* ——— máquina de café: vapor sobe enquanto o mouse está no
            hotspot `breville` (sem som, a pedido — clique continua
            abrindo o mapa de cafeterias, normalmente — ver handleActivate) ——— */}
        <div
          className={`cozy-steam${hoveredId === "breville" ? " is-on" : ""}`}
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
        />
      )}
      {djiOpen && <DjiPhotobooth onClosed={() => setDjiOpen(false)} originPoint={origin} />}
    </>
  );
}
