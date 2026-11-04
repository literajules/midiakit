"use client";

import { useState } from "react";
import { DOCK_APPS, type DockAppId } from "./dockApps";
import "./Dock.css";

type Props = {
  /** apps com janela aberta no momento — mostra o pontinho de "ativo" embaixo do ícone */
  activeIds: DockAppId[];
  /** último app clicado (dispara a animação de "quique") */
  bouncingId: DockAppId | null;
  onAppClick: (id: DockAppId) => void;
};

/**
 * Cor de fundo de cada ícone — aproximações do esquema de cores real de
 * cada app (não os logos exatos, são desenhos originais), pra ficarem
 * reconhecíveis como "os apps do Mac" na dock. `trash` não tem tile: o
 * ícone real da Lixeira (vazia) é uma lata de malha metálica solta, sem
 * fundo colorido — ver `BARE_IDS` abaixo.
 */
const BG: Record<DockAppId, string> = {
  finder: "linear-gradient(115deg,#1f6fe0 0%,#1f6fe0 49.5%,#7fd1ff 50.5%,#7fd1ff 100%)",
  safari: "radial-gradient(circle at 35% 30%,#fafdff,#dde6ee)",
  chrome: "radial-gradient(circle at 35% 30%,#ffffff,#eef1f5)",
  messages: "linear-gradient(160deg,#6ee07a,#1fbf3c)",
  mail: "linear-gradient(160deg,#6bb0ff,#1f64d6)",
  notes: "linear-gradient(160deg,#fffdf4,#fdf6df)",
  photos: "linear-gradient(160deg,#fdfdfd,#eef0f3)",
  music: "linear-gradient(155deg,#fd5c7a,#fa233b)",
  settings: "linear-gradient(160deg,#d6d9de,#9a9ea5)",
  trash: "transparent",
};

/** apps sem tile/sombra — o ícone fica "solto" na dock, igual o original */
const BARE_IDS: DockAppId[] = ["trash"];

/** glifos — desenhos originais inspirados no esquema visual dos apps reais do macOS, não os logos exatos */
function DockGlyph({ id }: { id: DockAppId }) {
  switch (id) {
    case "finder":
      return (
        <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
          <circle cx="8.3" cy="10.4" r="1.8" fill="#fff" />
          <circle cx="15.7" cy="10.4" r="1.8" fill="#0b2a52" />
          <path d="M7 15.2c2.2 2 7.8 2 10 0" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "safari":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="#b9c6d3" strokeWidth="1" />
          {Array.from({ length: 12 }, (_, i) => i * 30).map((deg) => (
            <line
              key={deg}
              x1="12"
              y1="3.4"
              x2="12"
              y2={deg % 90 === 0 ? 4.6 : 4.1}
              stroke="#9fb4c8"
              strokeWidth="0.7"
              transform={`rotate(${deg} 12 12)`}
            />
          ))}
          <path d="M12 5.2 13.4 12 12 12 10.6 12Z" fill="#e8503a" />
          <path d="M12 18.8 10.6 12 12 12 13.4 12Z" fill="#1f5fae" />
        </svg>
      );
    case "chrome":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <g transform="rotate(-90 12 12)">
            <circle cx="12" cy="12" r="8.4" fill="none" stroke="#ea4335" strokeWidth="5.4" strokeDasharray="100 200" pathLength={300} />
            <circle
              cx="12"
              cy="12"
              r="8.4"
              fill="none"
              stroke="#fbbc05"
              strokeWidth="5.4"
              strokeDasharray="100 200"
              strokeDashoffset="-100"
              pathLength={300}
            />
            <circle
              cx="12"
              cy="12"
              r="8.4"
              fill="none"
              stroke="#34a853"
              strokeWidth="5.4"
              strokeDasharray="100 200"
              strokeDashoffset="-200"
              pathLength={300}
            />
          </g>
          <circle cx="12" cy="12" r="4.6" fill="#fff" />
          <circle cx="12" cy="12" r="3" fill="#4285f4" />
        </svg>
      );
    case "messages":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M4 10.5c0-3.6 3.4-6 8-6s8 2.4 8 6-3.4 6-8 6c-.9 0-1.8-.1-2.6-.4L5 18l1-3.8C4.6 13 4 11.8 4 10.5Z"
            fill="#fff"
          />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
          <rect x="4" y="7" width="16" height="11" rx="1.6" fill="#fff" />
          <path d="M4.6 7.6 12 13 19.4 7.6" fill="none" stroke="#2f6fe0" strokeWidth="1.3" />
        </svg>
      );
    case "notes":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M5 4.5a1.5 1.5 0 0 1 1.5-1.5h11A1.5 1.5 0 0 1 19 4.5V7H5Z" fill="#ffcf4d" />
          <path d="M8 11h8M8 14h8M8 17h5" stroke="#b7b2a6" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "photos":
      return (
        <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
          <g>
            {[
              { deg: 0, color: "#ff5f57" },
              { deg: 60, color: "#ff9f43" },
              { deg: 120, color: "#ffd84d" },
              { deg: 180, color: "#52c97a" },
              { deg: 240, color: "#4aa8ff" },
              { deg: 300, color: "#b490ff" },
            ].map((petal) => (
              <ellipse
                key={petal.deg}
                cx="12"
                cy="7.2"
                rx="2.6"
                ry="4.4"
                fill={petal.color}
                opacity="0.92"
                transform={`rotate(${petal.deg} 12 12)`}
              />
            ))}
          </g>
          <circle cx="12" cy="12" r="2.2" fill="#fff" />
        </svg>
      );
    case "music":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="#fff">
          <circle cx="8" cy="17.5" r="2.6" />
          <rect x="9.7" y="6.5" width="1.6" height="11.6" />
          <path d="M9.7 6.5 17 4.2v3.1l-7.3 2.3Z" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="#fff">
          <path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Zm8.1 2.2-1.6-.3a6.6 6.6 0 0 0-.6-1.4l.9-1.3-1.6-1.6-1.3.9a6.6 6.6 0 0 0-1.4-.6l-.3-1.6h-2.4l-.3 1.6a6.6 6.6 0 0 0-1.4.6l-1.3-.9-1.6 1.6.9 1.3a6.6 6.6 0 0 0-.6 1.4l-1.6.3v2.4l1.6.3a6.6 6.6 0 0 0 .6 1.4l-.9 1.3 1.6 1.6 1.3-.9a6.6 6.6 0 0 0 1.4.6l.3 1.6h2.4l.3-1.6a6.6 6.6 0 0 0 1.4-.6l1.3.9 1.6-1.6-.9-1.3a6.6 6.6 0 0 0 .6-1.4l1.6-.3Z" />
        </svg>
      );
    case "trash":
      return (
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
          <defs>
            <linearGradient id="dock-trash-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f3f4f6" />
              <stop offset="1" stopColor="#aeb2ba" />
            </linearGradient>
          </defs>
          <path
            d="M7 8.2 7.9 20a1.6 1.6 0 0 0 1.6 1.5h5a1.6 1.6 0 0 0 1.6-1.5l.9-11.8"
            fill="none"
            stroke="url(#dock-trash-grad)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M5.5 8.2h13M9.5 8.2V6a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2.2" fill="none" stroke="url(#dock-trash-grad)" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M10 11v7M12 11v7M14 11v7" stroke="url(#dock-trash-grad)" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Dock — centrada embaixo, com o efeito de "lupa" do macOS (o ícone sob o
 * cursor cresce, os vizinhos crescem um pouco menos). Só o Chrome tem
 * ação de verdade (abre o `BrowserView`) — os outros são só cenário: nem
 * são `<button>`, não têm clique nem foco por teclado, pra não fingir um
 * app que não existe (`aria-hidden`, ver `.dock__item--inert`).
 *
 * O Chrome, por ser o único clicável, fica em evidência de propósito —
 * saltita sozinho num ciclo (pedido explícito: "induzir a pessoa a
 * clicar") e tem um pulso/brilho ao redor (`.dock__item--active`, ver
 * Dock.css `dock-attract`/`dock-glow`). Os outros ficam um pouco mais
 * discretos (opacidade reduzida) só pra reforçar o contraste — ainda bem
 * visíveis, não "apagados".
 */
export default function Dock({ activeIds, bouncingId, onAppClick }: Props) {
  const [hoverId, setHoverId] = useState<DockAppId | null>(null);
  const hoverIndex = hoverId ? DOCK_APPS.findIndex((a) => a.id === hoverId) : -1;

  return (
    <div className="dock" role="toolbar" aria-label="Dock">
      {DOCK_APPS.map((app, i) => {
        const dist = hoverIndex === -1 ? Infinity : Math.abs(i - hoverIndex);
        const scale = dist === 0 ? 1.34 : dist === 1 ? 1.16 : dist === 2 ? 1.06 : 1;
        const bare = BARE_IDS.includes(app.id);
        const clickable = app.id === "chrome";
        const className = [
          "dock__item",
          bare ? "dock__item--bare" : "",
          clickable ? "dock__item--active" : "dock__item--inert",
          bouncingId === app.id ? "is-bouncing" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const style = { transform: `scale(${scale})`, background: BG[app.id] };
        const hoverHandlers = {
          onMouseEnter: () => setHoverId(app.id),
          onMouseLeave: () => setHoverId((cur) => (cur === app.id ? null : cur)),
        };

        return clickable ? (
          <button
            key={app.id}
            type="button"
            className={className}
            style={style}
            aria-label={`${app.label} — abrir`}
            onClick={() => onAppClick(app.id)}
            {...hoverHandlers}
          >
            <DockGlyph id={app.id} />
            {activeIds.includes(app.id) && <span className="dock__dot" aria-hidden="true" />}
          </button>
        ) : (
          <div key={app.id} className={className} style={style} aria-hidden="true" {...hoverHandlers}>
            <DockGlyph id={app.id} />
          </div>
        );
      })}
    </div>
  );
}
