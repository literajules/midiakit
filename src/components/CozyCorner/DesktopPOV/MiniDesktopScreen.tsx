"use client";

import { useMemo, useRef } from "react";
import { useElementSize } from "@/lib/motion";
import { cssMatrix3d, rectToQuadMatrix, type Point } from "@/lib/cornerPin";
import { AppleMark, BatteryMark, FolderGlyph, MENU_ITEMS, WifiMark, useMenubarClock } from "./DesktopPOV";
import { BARE_IDS, BG, DockGlyph } from "./Dock";
import { BRAND_LOGOS } from "./brandLogos";
import { DESKTOP_FOLDERS } from "./folders";
import { DOCK_APPS } from "./dockApps";
import "./MiniDesktopScreen.css";

/** canvas "de frente" antes de aplicar a perspectiva — qualquer proporção
 * serve (a homografia encaixa nos 4 cantos de qualquer jeito), escolhido
 * só por ser um número redondo fácil de posicionar os elementos dentro. */
const CANVAS_W = 480;
const CANVAS_H = 270;

type Props = {
  /** os 4 cantos da tela do laptop NA FOTO, em % da cena (mesma
   * convenção dos hotspots — ver hotspots.ts) — medidos com uma grade de
   * referência em cima da foto (`cafe-scene.webp`), já com uma pequena
   * margem pra dentro do bisel (ver comentário em CozyCorner.tsx). */
  corners: { tl: Point; tr: Point; br: Point; bl: Point };
};

/**
 * Réplica em miniatura do "POV do desktop" (DesktopPOV.tsx), projetada
 * com perspectiva de verdade (ver lib/cornerPin.ts) pra encaixar
 * exatamente nos 4 cantos da tela do laptop fotografada. Reaproveita os
 * MESMOS glifos/dados do desktop de verdade (wallpaper = a própria foto,
 * sem duplicar; ícones da dock, pastas, logos de marca, relógio da barra
 * de menu) — nada desenhado do zero outra vez.
 *
 * Hierarquia de camadas (de baixo pra cima, via `z-index` explícito no
 * CSS — ver MiniDesktopScreen.css): 1) wallpaper = a própria foto (não
 * desenhamos nenhuma aqui); 2) pastas do desktop; 3) dock; 4) [sem
 * janelas de app na miniatura — a janela de verdade é o `DesktopPOV` de
 * tela cheia, aberto pelo hotspot `laptop`]; 5) barra de menu, sempre por
 * cima de tudo, igual ao macOS de verdade.
 *
 * Tudo aqui é `pointer-events: none` (decoração, por baixo do hotspot
 * `laptop` de verdade, que cobre a mesma área e continua abrindo a tela
 * cheia no clique) — COM UMA RESSALVA: o hover de "lupa" pedido pra dock
 * (`.mini-desktop__dock-item:hover`) está implementado em CSS, mas como
 * o botão do hotspot `laptop` fica por CIMA desta camada (necessário pra
 * continuar clicável em toda a área do laptop), o mouse nunca chega de
 * verdade aos ícones por baixo — esse `:hover` não tem como disparar
 * nesta estrutura. Documentado aqui de propósito; ver a conversa sobre
 * esse ponto antes de investir mais nisso.
 */
export default function MiniDesktopScreen({ corners }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { w, h } = useElementSize(wrapRef, { w: 0, h: 0 });
  const clock = useMenubarClock();

  const transform = useMemo(() => {
    if (!w || !h) return null;
    const toPx = (p: Point): Point => ({ x: (p.x / 100) * w, y: (p.y / 100) * h });
    const matrix = rectToQuadMatrix(CANVAS_W, CANVAS_H, {
      tl: toPx(corners.tl),
      tr: toPx(corners.tr),
      br: toPx(corners.br),
      bl: toPx(corners.bl),
    });
    return cssMatrix3d(matrix);
  }, [w, h, corners]);

  return (
    <div ref={wrapRef} className="mini-desktop-wrap" aria-hidden="true">
      {transform && (
        <div className="mini-desktop" style={{ transform: `matrix3d(${transform})` }}>
          {/* SEM wallpaper próprio de propósito: a foto já tem o wallpaper
              de verdade "gravado" na tela do laptop — o fundo visível
              aqui é a própria foto, por baixo desta camada. */}

          {/* ——— pastas do desktop: grade 2 colunas, canto superior
              direito, abaixo da barra de menu (ver DESKTOP_FOLDERS —
              mesmas 3 pastas REAIS do site, "Entregas"/"Sobre mim"/
              "Conteúdos"; não inventei uma 4ª pasta "Personal" sem
              função por trás, só pra bater com a foto de referência). ——— */}
          <div className="mini-desktop__folders">
            {DESKTOP_FOLDERS.map((folder) => (
              <div key={folder.id} className="mini-desktop__folder">
                <FolderGlyph />
                <span className="mini-desktop__folder-label">{folder.label}</span>
              </div>
            ))}
          </div>

          <div className="mini-desktop__brands">
            {BRAND_LOGOS.map((brand) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={brand.id} src={brand.logoSrc} alt="" className="mini-desktop__brand-logo" />
            ))}
          </div>

          {/* ——— dock: maior que a 1ª versão (~40%), centralizada, com
              margem de segurança até a borda inferior do bisel — ver
              MiniDesktopScreen.css. ——— */}
          <div className="mini-desktop__dock">
            {DOCK_APPS.map((app) => (
              <span
                key={app.id}
                className={`mini-desktop__dock-item${BARE_IDS.includes(app.id) ? " mini-desktop__dock-item--bare" : ""}`}
                style={{ background: BG[app.id] }}
              >
                <DockGlyph id={app.id} />
              </span>
            ))}
          </div>

          {/* ——— barra de menu: sempre a camada mais de cima (ver
              z-index no CSS), igual ao macOS de verdade — nunca fica
              escondida atrás de pasta/dock/janela nenhuma. ——— */}
          <div className="mini-desktop__menubar">
            <span className="mini-desktop__menubar-apple">
              <AppleMark />
            </span>
            <span className="mini-desktop__menubar-app">Finder</span>
            {MENU_ITEMS.map((item) => (
              <span key={item} className="mini-desktop__menubar-item">
                {item}
              </span>
            ))}
            <span className="mini-desktop__menubar-status">
              <WifiMark />
              <BatteryMark />
              <span className="mini-desktop__menubar-clock">{clock}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
