"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import "./DesktopWindow.css";

type Props = {
  /** título mostrado na barra (ignorado se `titleBarContent` for passado — ex. as abas do navegador) */
  title?: string;
  titleBarContent?: ReactNode;
  /** fecha a janela de vez (desmonta) */
  onClose: () => void;
  /** traz pra frente das outras janelas abertas */
  onFocus: () => void;
  zIndex: number;
  /** deslocamento inicial (px) a partir do centro do palco — pra janelas novas não nascerem empilhadas em cima das outras */
  initialOffset?: { x: number; y: number };
  /**
   * false = o semáforo fica só com o "fechar" (vermelho) clicável; "minimizar"
   * (amarelo) e "maximizar" (verde) ficam decorativos, sem ação — a janela
   * mantém sempre o mesmo tamanho padronizado (ver `BrowserView`). Default
   * `true` (comportamento de antes, usado pela `FolderWindow`).
   */
  maximizable?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Janela de desktop reutilizável — a "moldura" (barra de título com traffic
 * lights, arrastar, maximizar) usada tanto pelo `BrowserView` (Safari) como
 * pela `FolderWindow` (Finder).
 *
 * Com `maximizable` (default): "fechar" (vermelho) e "maximizar" (verde,
 * alterna um tamanho grande) têm ação de verdade; "minimizar" (amarelo) é só
 * feedback visual — minimizar de verdade exigiria um lugar pra guardar a
 * janela minimizada (um slot na dock, por exemplo) que ainda não existe,
 * então fingir a ação sem um jeito de desfazer seria um beco sem saída pra
 * quem usa.
 *
 * Com `maximizable={false}`: só "fechar" tem ação; "minimizar" e "maximizar"
 * ficam decorativos (nem são `<button>`) — a janela nunca muda de tamanho.
 */
export default function DesktopWindow({
  title,
  titleBarContent,
  onClose,
  onFocus,
  zIndex,
  initialOffset = { x: 0, y: 0 },
  maximizable = true,
  className,
  children,
}: Props) {
  const [pos, setPos] = useState(initialOffset);
  const [maximized, setMaximized] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const onTitleBarPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (maximized) return;
    if ((e.target as HTMLElement).closest(".desktop-window__traffic")) return;
    onFocus();
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: pos.x, baseY: pos.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onTitleBarPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const nextX = drag.baseX + (e.clientX - drag.startX);
    const nextY = drag.baseY + (e.clientY - drag.startY);
    // limite generoso pra janela nunca ficar impossível de recuperar
    const clamp = (v: number, max: number) => Math.min(max, Math.max(-max, v));
    setPos({ x: clamp(nextX, window.innerWidth * 0.46), y: clamp(nextY, window.innerHeight * 0.4) });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const style: CSSProperties = maximized
    ? { zIndex }
    : { zIndex, translate: `calc(-50% + ${pos.x}px) calc(-50% + ${pos.y}px)` };

  return (
    <div
      className={`desktop-window${maximized ? " is-maximized" : ""}${className ? ` ${className}` : ""}`}
      style={style}
      onPointerDown={onFocus}
    >
      <div
        className="desktop-window__titlebar"
        onPointerDown={onTitleBarPointerDown}
        onPointerMove={onTitleBarPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="desktop-window__traffic">
          <button type="button" className="desktop-window__dot desktop-window__dot--close" onClick={onClose} aria-label="Fechar" />
          <span className="desktop-window__dot desktop-window__dot--min" aria-hidden="true" />
          {maximizable ? (
            <button
              type="button"
              className="desktop-window__dot desktop-window__dot--max"
              onClick={() => setMaximized((v) => !v)}
              aria-label={maximized ? "Restaurar" : "Maximizar"}
            />
          ) : (
            <span className="desktop-window__dot desktop-window__dot--max" aria-hidden="true" />
          )}
        </div>

        <div className="desktop-window__titlebar-content">
          {titleBarContent ?? <span className="desktop-window__title">{title}</span>}
        </div>
      </div>

      <div className="desktop-window__body">{children}</div>
    </div>
  );
}
