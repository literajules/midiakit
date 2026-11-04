"use client";

import { useState } from "react";
import DesktopWindow from "./DesktopWindow";
import "./BrowserView.css";

/**
 * A "visão do navegador" aberta pelo ícone do Chrome na dock — janela
 * Safari-style (usa a moldura compartilhada `DesktopWindow`: traffic
 * lights, arrastar, maximizar) com duas abas: LinkedIn e Instagram.
 *
 * LinkedIn e Instagram NÃO podem ser embutidos de verdade num iframe (os
 * dois bloqueiam isso via X-Frame-Options/CSP) — por isso o conteúdo de
 * cada aba é um PRINT real do perfil (imagem estática, com scroll quando
 * mais alta que a janela — a rolagem é só da área de conteúdo, nunca da
 * janela toda). A barra de endereço é só informativa (texto, não link); o
 * botão "Abrir perfil real ↗" embaixo do print é que leva pro perfil de
 * verdade, numa aba nova do navegador de verdade.
 *
 * Janela de tamanho fixo e padronizado: `maximizable={false}` na
 * `DesktopWindow` — só o "fechar" (vermelho) do semáforo tem ação;
 * "minimizar" e "maximizar" ficam decorativos, a janela nunca muda de
 * tamanho (ver DesktopWindow.tsx).
 */

type ProfileId = "linkedin" | "instagram";

/** `icon: "text"` — sigla simples (ex. "in" do LinkedIn, cor sólida da marca).
 * `icon: "instagram"` — logo de verdade (câmera + lente + flash), não emoji:
 * emoji de câmera renderiza diferente em cada SO/navegador (às vezes nem
 * parece logo), o SVG fica igual em qualquer lugar. */
type Badge = { icon: "text"; text: string; background: string } | { icon: "instagram"; background: string };

type ProfileBookmark = {
  id: ProfileId;
  label: string;
  url: string;
  screenshotSrc: string;
  screenshotAlt: string;
  badge: Badge;
};

// Instagram primeiro (aba padrão ao abrir o Chrome); LinkedIn é "a outra
// aba" — ordem da lista = ordem/aba ativa inicial (ver `useState` abaixo).
const TABS: ProfileBookmark[] = [
  {
    id: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/literajules",
    screenshotSrc: "/images/desktop/browser/instagram-screenshot.png",
    screenshotAlt: "Print do perfil do Instagram @literajules",
    badge: { icon: "instagram", background: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)" },
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/juliaguyer/",
    screenshotSrc: "/images/desktop/browser/linkedin-screenshot.png",
    screenshotAlt: "Print do perfil do LinkedIn de Julia Guyer",
    badge: { icon: "text", text: "in", background: "#0a66c2" },
  },
];

/** Glifo do Instagram desenhado na mão (quadrado arredondado + lente +
 * "flash" no canto) — não é o logo oficial pixel a pixel, mas lê como
 * Instagram de longe, sem precisar de um arquivo de imagem só pra isso. */
function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.4" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="#fff" />
    </svg>
  );
}

type Props = {
  onClosed: () => void;
  onFocus: () => void;
  zIndex: number;
  initialOffset?: { x: number; y: number };
};

export default function BrowserView({ onClosed, onFocus, zIndex, initialOffset }: Props) {
  const [activeId, setActiveId] = useState<ProfileId>("instagram");
  const current = TABS.find((t) => t.id === activeId) ?? TABS[0];
  const addressText = current.url.replace(/^https?:\/\//, "");

  const tabs = (
    <div className="browser-view__tabs" role="tablist" aria-label="Abas abertas">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeId === tab.id}
          className={`browser-view__tab${activeId === tab.id ? " is-active" : ""}`}
          onClick={() => setActiveId(tab.id)}
        >
          <span className="browser-view__tab-icon" aria-hidden="true" style={{ background: tab.badge.background }}>
            {tab.badge.icon === "instagram" ? <InstagramGlyph /> : tab.badge.text}
          </span>
          <span className="browser-view__tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <DesktopWindow
      className="browser-view"
      titleBarContent={tabs}
      onClose={onClosed}
      onFocus={onFocus}
      zIndex={zIndex}
      initialOffset={initialOffset}
      maximizable={false}
    >
      <div className="browser-view__addressbar">
        <svg className="browser-view__lock" viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
          <path
            d="M4 7V5a4 4 0 1 1 8 0v2m-9 0h10v7H3V7Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
        {/* só texto — quem redireciona pro perfil real é o botão abaixo do print */}
        <span className="browser-view__url">{addressText}</span>
      </div>

      <div className="browser-view__page">
        {/* key no contêiner de rolagem (não só na imagem): remonta o `div`
            inteiro ao trocar de aba, senão o scrollTop fica "herdado" da
            aba anterior — por isso o LinkedIn parecia abrir desalinhado
            (no meio do print) quando se vinha do Instagram já rolado. */}
        <div key={current.id} className="browser-view__scroll">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.screenshotSrc} alt={current.screenshotAlt} className="browser-view__screenshot" />
        </div>
        <a
          className="browser-view__cta"
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir o perfil de ${current.label} de verdade, numa nova aba`}
        >
          Abrir perfil real ↗
        </a>
      </div>
    </DesktopWindow>
  );
}
