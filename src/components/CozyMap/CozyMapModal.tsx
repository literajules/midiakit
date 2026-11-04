"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/lib/motion";
import CozyMapCanvas, { type Insets } from "./CozyMapCanvas";
import { CITIES, placesIn, visiblePlaces, type CityId } from "./cozyPlaces";
import "./CozyMap.css";

/**
 * "The Cozy Map by Jules" — janela modal aberta pela máquina de café.
 *
 * Comportamento:
 *  - abre com fade do fundo + leve escala/opacidade da janela (GSAP) e fecha na ordem inversa;
 *  - trava a rolagem da página (overflow: hidden no <html>, sem mover o scroll) e a devolve igual;
 *  - fecha com X, Esc ou clique fora; o foco volta ao elemento que abriu;
 *  - foco preso dentro da janela enquanto aberta (Tab / Shift+Tab);
 *  - usa portal em document.body (a cafeteria tem `transform`, que quebraria o position: fixed).
 */

/** Mesma condição do CSS (.cozy-map__dialog): painéis flutuantes sobre o mapa. */
const FLOATING_QUERY = "(min-width: 900px) and (min-height: 560px)";
const SOLO_INSETS: Insets = { top: 44, right: 44, bottom: 56, left: 44 };

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Props = {
  /** chamado depois que a animação de saída termina; o pai deve desmontar o modal */
  onClosed: () => void;
};

const sameInsets = (a: Insets, b: Insets) =>
  a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left;

export default function CozyMapModal({ onClosed }: Props) {
  const reduced = usePrefersReducedMotion();

  const overlayRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const pointerDownOnBackdrop = useRef(false);
  const firstCityRender = useRef(true);

  // cidade inicial: a primeira que tenha lugares; senão New York
  const [city, setCity] = useState<CityId>(() => CITIES.find((c) => placesIn(c.id).length > 0)?.id ?? "new-york");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [insets, setInsets] = useState<Insets>(SOLO_INSETS);

  const places = useMemo(() => placesIn(city), [city]);
  const cityDef = CITIES.find((c) => c.id === city) ?? CITIES[0];
  const hasDemo = visiblePlaces.some((p) => p.demo);

  /* ---- fechar (animação inversa, depois avisa o pai) ---- */
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const dialog = dialogRef.current;
    const backdrop = backdropRef.current;
    if (!dialog || !backdrop) {
      onClosed();
      return;
    }
    gsap.killTweensOf([dialog, backdrop]);
    const tl = gsap.timeline({ onComplete: onClosed });
    if (reduced) {
      tl.to([dialog, backdrop], { opacity: 0, duration: 0.15, ease: "none" });
    } else {
      tl.to(dialog, { opacity: 0, scale: 0.96, y: 12, duration: 0.42, ease: "power2.in" }, 0).to(
        backdrop,
        { opacity: 0, duration: 0.5, ease: "power1.inOut" },
        0.06
      );
    }
  }, [onClosed, reduced]);

  /* ---- abertura ---- */
  useEffect(() => {
    const overlay = overlayRef.current;
    const dialog = dialogRef.current;
    const backdrop = backdropRef.current;
    if (!overlay || !dialog || !backdrop) return;

    const inner = [headerRef.current, panelRef.current].filter(Boolean) as HTMLElement[];
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.fromTo([backdrop, dialog], { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none" });
        return;
      }
      const tl = gsap.timeline();
      tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: "power1.out" }, 0)
        .fromTo(
          dialog,
          { opacity: 0, scale: 0.94, y: 18 },
          { opacity: 1, scale: 1, y: 0, duration: 0.75, ease: "power3.out", clearProps: "transform" },
          0.08
        )
        .fromTo(
          inner,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", clearProps: "transform,opacity" },
          0.32
        );
    }, overlay);

    dialog.focus({ preventScroll: true });
    return () => ctx.revert();
    // só na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- trava a rolagem da página e devolve exatamente como estava ---- */
  useEffect(() => {
    const root = document.documentElement;
    const y = window.scrollY;
    const x = window.scrollX;
    const prev = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    // mantém a largura da página: sem isso o layout "pula" quando a barra some
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;

    return () => {
      root.style.overflow = prev.overflow;
      root.style.paddingRight = prev.paddingRight;
      if (window.scrollY !== y || window.scrollX !== x) window.scrollTo(x, y);
    };
  }, []);

  /* ---- devolve o foco a quem abriu ---- */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    return () => {
      if (opener && opener !== document.body && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, []);

  /* ---- Esc fecha ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [requestClose]);

  /* ---- áreas cobertas por cabeçalho/painel (a câmera do mapa as evita) ---- */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const mq = window.matchMedia(FLOATING_QUERY);
    const measure = () => {
      const header = headerRef.current;
      const panel = panelRef.current;
      let next = SOLO_INSETS;
      if (mq.matches && header && panel) {
        next = {
          top: header.offsetTop + header.offsetHeight + 28,
          right: panel.offsetWidth + 20 + 28,
          bottom: 56,
          left: 48,
        };
      }
      setInsets((cur) => (sameInsets(cur, next) ? cur : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(dialog);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, []);

  /* ---- troca de cidade: a lista reaparece com um leve escalonamento ---- */
  useEffect(() => {
    const list = scrollRef.current;
    if (!list) return;
    const first = firstCityRender.current;
    firstCityRender.current = false;
    if (reduced) return;
    const items = list.querySelectorAll(".cozy-item, .cozy-empty");
    const tween = gsap.fromTo(
      items,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        delay: first ? 0.55 : 0.05,
        ease: "power2.out",
        clearProps: "transform,opacity",
      }
    );
    return () => {
      tween.kill();
      gsap.set(items, { clearProps: "transform,opacity" });
    };
  }, [city, reduced]);

  /* ---- seleção: o item ativo sobe até ficar visível dentro da lista ---- */
  const select = useCallback(
    (id: string, from: "pin" | "list") => {
      setSelectedId(id);
      if (from !== "pin") return;
      const list = scrollRef.current;
      const item = list?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`);
      if (list && item) {
        list.scrollTo({ top: Math.max(0, item.offsetTop - 12), behavior: reduced ? "auto" : "smooth" });
      }
    },
    [reduced]
  );

  const changeCity = (id: CityId) => {
    if (id === city) return;
    setCity(id);
    setSelectedId(null);
  };

  /* ---- foco preso na janela ---- */
  const onDialogKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const nodes = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (n) => n.offsetParent !== null && !n.closest("[inert]")
    );
    if (nodes.length === 0) {
      e.preventDefault();
      return;
    }
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const modal = (
    <div
      ref={overlayRef}
      className="cozy-map"
      onPointerDown={(e) => {
        pointerDownOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        // só fecha se o toque começou E terminou no fundo (arrastar o mapa e soltar fora não fecha)
        if (e.target === e.currentTarget && pointerDownOnBackdrop.current) requestClose();
        pointerDownOnBackdrop.current = false;
      }}
    >
      <div ref={backdropRef} className="cozy-map__backdrop" aria-hidden="true" />

      <div
        ref={dialogRef}
        className="cozy-map__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cozy-map-title"
        aria-describedby="cozy-map-sub"
        tabIndex={-1}
        onKeyDown={onDialogKeyDown}
      >
        <CozyMapCanvas
          city={city}
          places={places}
          selectedId={selectedId}
          onSelect={(id) => select(id, "pin")}
          insets={insets}
          reduced={reduced}
        />

        <header ref={headerRef} className="cozy-map__header">
          <p className="cozy-map__sign">the cozy map · by jules</p>
          <h2 id="cozy-map-title" className="cozy-map__title">
            um bom café &amp; um livro
          </h2>
          <p id="cozy-map-sub" className="cozy-map__sub">
            minha coleção de lugares que vale a pena conhecer.
          </p>
          <div className="cozy-cities" role="group" aria-label="Escolha a cidade">
            {CITIES.map((c) => {
              const n = placesIn(c.id).length;
              const on = c.id === city;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`cozy-cities__btn${on ? " is-on" : ""}`}
                  aria-pressed={on}
                  onClick={() => changeCity(c.id)}
                >
                  {c.label}
                  {n > 0 && <span className="cozy-cities__n">{n}</span>}
                </button>
              );
            })}
          </div>
          {hasDemo && <span className="cozy-map__demo">dados de exemplo</span>}
        </header>

        <aside ref={panelRef} className="cozy-panel" aria-label={`Lugares em ${cityDef.label}`}>
          <div ref={scrollRef} className="cozy-panel__scroll">
            {places.length > 0 ? (
              <ol className="cozy-panel__list">
                {places.map((p, i) => {
                  const on = p.id === selectedId;
                  return (
                    <li
                      key={p.id}
                      data-id={p.id}
                      className={`cozy-item${on ? " is-active" : ""}`}
                      onClick={() => select(p.id, "list")}
                    >
                      <span className="cozy-item__num" aria-hidden="true">
                        {i + 1}
                      </span>
                      <div className="cozy-item__body">
                        <div className="cozy-item__title">
                          <button
                            type="button"
                            className="cozy-item__name"
                            aria-pressed={on}
                            onClick={(e) => {
                              e.stopPropagation();
                              select(p.id, "list");
                            }}
                          >
                            {p.name}
                          </button>
                          <a
                            className="cozy-item__link"
                            href={p.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir no Google Maps"
                            aria-label={`Abrir ${p.name} no Google Maps (nova aba)`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                              <path d="M3 9 9 3M4.2 3H9v4.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                          {p.demo && <span className="cozy-item__tag">exemplo</span>}
                        </div>
                        {p.description && <p className="cozy-item__desc">{p.description}</p>}
                        <p className="cozy-item__meta">
                          {p.neighborhood} · {p.address}
                        </p>
                      </div>
                      {p.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="cozy-item__img" src={p.imageUrl} alt="" loading="lazy" decoding="async" />
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="cozy-empty">
                <span className="cozy-empty__pin" aria-hidden="true" />
                <p className="cozy-empty__title">{cityDef.label} ainda está no forno.</p>
                <p className="cozy-empty__text">Os lugares favoritos daqui entram em breve. Volte para espiar.</p>
              </div>
            )}
          </div>
        </aside>

        <button type="button" className="cozy-map__close" onClick={requestClose} aria-label="Fechar o mapa">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M3 3 13 13M13 3 3 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
