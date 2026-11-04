"use client";

import { useEffect, useRef, useState } from "react";
import { useNoHover, usePrefersReducedMotion } from "@/lib/motion";
import "./CustomCursor.css";

/**
 * Cursor customizado do dollhouse: a setinha rosa (padrão) troca pro
 * gatinho espantado sempre que o mouse passa por cima de algo clicável
 * (ver `INTERACTIVE_SELECTOR` abaixo) — cobre hotspots, botões do mapa,
 * ícones do desktop, links etc. de graça, sem marcar elemento por elemento.
 *
 * Desligado em touch (sem hover, `useNoHover`) e com `prefers-reduced-motion`:
 * nesses casos o cursor nativo do sistema continua valendo — sem perda de
 * uso, só sem o afago extra.
 *
 * Posição aplicada via `transform` direto no ref (não via estado React) e
 * throttled num único `requestAnimationFrame` por quadro, pra acompanhar o
 * mouse sem re-renderizar a árvore inteira a 60fps.
 */

/**
 * Elementos "clicáveis" do site. Checar `cursor: pointer` computado NÃO
 * funciona aqui: o próprio `html.custom-cursor-active *` (ver .css) força
 * `cursor: none !important` em TUDO pra escondar o cursor nativo — isso
 * também pisa no valor computado dos botões/links, então a leitura sempre
 * dava "none". Por isso a lista explícita: tags nativamente clicáveis +
 * `.cozy-item` (único caso no projeto de clique num elemento que não é
 * `<button>`/`<a>` — a linha inteira do lugar no mapa, ver CozyMapModal).
 */
const INTERACTIVE_SELECTOR = 'a[href], button, [role="button"], input, select, textarea, label, .cozy-item';

function isOverInteractive(el: Element | null): boolean {
  return el?.closest(INTERACTIVE_SELECTOR) != null;
}

export default function CustomCursor() {
  const noHover = useNoHover();
  const reducedMotion = usePrefersReducedMotion();
  const active = !noHover && !reducedMotion;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;

    document.documentElement.classList.add("custom-cursor-active");

    let frame = 0;
    let x = -100;
    let y = -100;
    let target: Element | null = null;

    const applyFrame = () => {
      frame = 0;
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      setHovering(isOverInteractive(target));
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      target = e.target as Element;
      setVisible(true);
      if (!frame) frame = window.requestAnimationFrame(applyFrame);
    };

    const onLeaveWindow = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    // pointerdown também atualiza posição/estado — cobre o primeiro clique
    // antes de qualquer movimento do mouse (ex. logo depois de um toque).
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={wrapperRef}
      className={`custom-cursor${visible ? " is-visible" : ""}`}
      aria-hidden="true"
    >
      <div className={`custom-cursor__img${hovering ? " is-hover" : ""}`} />
    </div>
  );
}
