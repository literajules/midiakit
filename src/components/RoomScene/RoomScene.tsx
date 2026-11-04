"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type UIEvent } from "react";
import { ramp, useElementSize, usePrefersReducedMotion, useScrollProgress } from "@/lib/motion";
import Hotspot from "./Hotspot";
import { HOTSPOT_DEBUG } from "./debug";
import { computeSceneLayout, focalScrollLeft, type SceneLayoutOptions } from "./layout";
import type { HotspotDef } from "./types";
import "./RoomScene.css";

/**
 * Cena genérica: uma foto única com hotspots clicáveis sobre ela, dentro de
 * uma seção "scrollytelling" (entra na tela com scroll, fica pinada —
 * `position: sticky` — enquanto o visitante termina de rolar aquele trecho).
 *
 * Generalizado a partir de literajules-site/src/components/CafeScene —
 * mesmo padrão (quadro com a proporção da imagem, modo "cover"/"pan", modo
 * de teste dos hotspots), parametrizado por props pra servir o quarto, o
 * cozy corner e qualquer cena futura. A foto SEMPRE cobre 100% da tela —
 * sem bordas, sem fundo desfocado simulando continuação da foto (ver
 * layout.ts pro porquê de cada modo e `layoutOptions.focalX/focalY` em
 * cada cena pro porquê do ponto focal escolhido).
 *
 * O scroll só controla a ENTRADA da cena (fade + leve recuo de câmera). Os
 * cliques nos hotspots não têm nada a ver com scroll — são interações
 * normais de clique, incluindo a eventual transição pra outra cena (porta).
 */

export type RoomSceneProps = {
  /** id/aria-label da <section> */
  id: string;
  ariaLabel: string;
  /** tamanho natural da imagem de fundo (px) */
  sceneW: number;
  sceneH: number;
  imageSrc: string;
  imageAlt: string;
  hotspots: HotspotDef[];
  onActivate: (def: HotspotDef, el: HTMLButtonElement) => void;
  /** hotspot ativo (realce visual no modo de teste) */
  activeId?: string | null;
  /** avisa quando o mouse entra/sai de um hotspot (ver Hotspot.tsx) */
  onHotspotHover?: (id: string, hovering: boolean) => void;
  layoutOptions?: SceneLayoutOptions;
  /** cor de fundo da seção (var CSS), ex. "var(--cream)" */
  background?: string;
  /** dica mostrada no modo "pan" (celular) */
  panHint?: string;
  /**
   * `true` (padrão): a cena esmaece/assenta conforme o scroll a revela —
   * certo pra cenas que vêm DEPOIS de outra seção (ex. cozy corner, se um
   * dia vier atrás de mais conteúdo). `false`: a cena já aparece inteira e
   * interativa assim que monta, sem precisar rolar — certo pra primeira
   * cena do site (nada vem antes dela pra "revelar" por scroll).
   */
  revealOnScroll?: boolean;
  /** conteúdo extra desenhado DENTRO do quadro, na mesma escala da foto
   * (ex.: a bonequinha, um brilho sobre a porta) — recebe o layout atual
   * pra poder se posicionar em % como os hotspots. */
  children?: ReactNode;
};

export default function RoomScene({
  id,
  ariaLabel,
  sceneW,
  sceneH,
  imageSrc,
  imageAlt,
  hotspots,
  onActivate,
  activeId = null,
  onHotspotHover,
  layoutOptions,
  background,
  panHint = "‹ deslize para explorar ›",
  revealOnScroll = true,
  children,
}: RoomSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const reduced = usePrefersReducedMotion();
  const { w, h } = useElementSize(stageRef, { w: 1440, h: 900 });
  const p = useScrollProgress(sectionRef, {
    start: "top 20%",
    end: "bottom bottom",
    smooth: 0.8,
  });

  const layout = useMemo(
    () => computeSceneLayout(w, h, { w: sceneW, h: sceneH }, layoutOptions),
    [w, h, sceneW, sceneH, layoutOptions]
  );
  const isPan = layout.mode === "pan";
  const focalX = layoutOptions?.focalX ?? 0.5;

  // sem scroll pra revelar: a cena já nasce visível e assentada (só o
  // useScrollProgress fica "desligado" — section vira 100vh, sem pin).
  const fade = revealOnScroll ? ramp(p, 0.12, 0.6) : 1;
  const settle = !revealOnScroll || reduced ? 1 : 1 + (1 - ramp(p, 0.15, 1)) * 0.035;

  const lastFrameW = useRef(0);
  const initialLeft = useRef(0);
  const [panned, setPanned] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !isPan) {
      lastFrameW.current = 0;
      return;
    }
    if (lastFrameW.current === 0) {
      el.scrollLeft = focalScrollLeft(layout, w, focalX);
      initialLeft.current = el.scrollLeft;
    } else if (lastFrameW.current !== layout.frameW) {
      const center = (el.scrollLeft + w / 2) / lastFrameW.current;
      el.scrollLeft = center * layout.frameW - w / 2;
    }
    lastFrameW.current = layout.frameW;
  }, [isPan, layout, w, focalX]);

  const visibleHotspots = hotspots
    .map((def, i) => ({ def, i }))
    .filter(({ def }) => def.enabled || HOTSPOT_DEBUG);

  const frameStyle: CSSProperties = {
    left: layout.left,
    top: layout.top,
    width: layout.frameW,
    height: layout.frameH,
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`room-scene${revealOnScroll ? "" : " room-scene--static"}`}
      aria-label={ariaLabel}
      style={background ? ({ "--room-scene-bg": background } as CSSProperties) : undefined}
    >
      <div className="room-scene__pin">
        <div ref={stageRef} className="room-scene__stage" style={{ opacity: fade }}>
          <div className="room-scene__camera" style={{ transform: `scale(${settle})` }}>
            <div
              ref={scrollerRef}
              className={`room-scene__scroller${isPan ? " is-pan" : ""}`}
              {...(isPan
                ? {
                    tabIndex: 0,
                    role: "region",
                    "aria-label": `${ariaLabel}. Deslize na horizontal para ver todos os objetos.`,
                    onScroll: (e: UIEvent<HTMLDivElement>) => {
                      if (!panned && Math.abs(e.currentTarget.scrollLeft - initialLeft.current) > 24) setPanned(true);
                    },
                  }
                : {})}
            >
              <div className="room-scene__track" style={{ width: isPan ? layout.frameW : "100%" }}>
                <div className="room-scene__frame" style={frameStyle} data-mode={layout.mode}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageSrc} alt={imageAlt} draggable={false} className="room-scene__img" />

                  {children}

                  <div className="room-scene__hotspots" style={{ pointerEvents: fade > 0.6 ? "auto" : "none" }}>
                    {visibleHotspots.map(({ def, i }) => (
                      <Hotspot
                        key={def.id}
                        def={def}
                        index={i}
                        debug={HOTSPOT_DEBUG}
                        active={activeId === def.id}
                        onActivate={onActivate}
                        onHover={onHotspotHover}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isPan && (
            <span className={`room-scene__hint${panned ? " is-hidden" : ""}`} aria-hidden="true">
              {panHint}
            </span>
          )}

          {HOTSPOT_DEBUG && (
            <span className="room-scene__badge" aria-hidden="true">
              modo teste · hotspots
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
