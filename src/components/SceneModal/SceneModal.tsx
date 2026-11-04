"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/lib/motion";
import "./SceneModal.css";

/**
 * Modal genérico aberto por um hotspot de uma cena (RoomScene). Extraído do
 * "chuzado" do CozyMapModal (literajules-site) — tudo que não é específico
 * do mapa: abertura/fechamento animados, trava de scroll, foco preso, Esc/
 * clique fora, devolução de foco pra quem abriu.
 *
 * Serve pra: ficha, playlist, estante de livros, desktop POV, e qualquer
 * outra experiência que abra por cima da cena.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Props = {
  /** chamado depois que a animação de saída termina; o pai deve desmontar o modal */
  onClosed: () => void;
  /** classe extra no <div class="scene-modal__dialog">, pra estilizar cada experiência */
  dialogClassName?: string;
  /** classe extra no <div class="scene-modal">, pra experiências que precisam remover o
   * padding/centralização padrão do overlay (ex. uma "tela cheia", como o desktop POV) */
  overlayClassName?: string;
  "aria-labelledby": string;
  "aria-describedby"?: string;
  children: ReactNode;
  /**
   * Ponto de origem em coordenadas de tela (ex. centro do hotspot clicado).
   * Quando presente, o modal "nasce" visualmente desse ponto (zoom a partir
   * do objeto) em vez de crescer a partir do centro da tela — usado no
   * quadro de recados e no relógio.
   */
  originPoint?: { x: number; y: number } | null;
  /**
   * Chamado quando a animação de ABERTURA termina (ou, com movimento
   * reduzido, quando o fade rápido termina) — pra conteúdo que só deve
   * começar a aparecer/animar depois que o "papel" já estiver todo visível
   * (ex. título digitado + métricas em cascata do quadro de recados/
   * relógio, ver NoteModal.tsx). Opcional: a maioria dos modais não precisa.
   */
  onOpened?: () => void;
};

export default function SceneModal({
  onClosed,
  dialogClassName,
  overlayClassName,
  children,
  originPoint,
  onOpened,
  ...aria
}: Props) {
  const reduced = usePrefersReducedMotion();

  const overlayRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const pointerDownOnBackdrop = useRef(false);

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

    // zoom a partir do objeto: a origem da transformação vira o ponto onde
    // o visitante clicou, em vez do centro do próprio modal.
    if (originPoint) {
      const rect = dialog.getBoundingClientRect();
      dialog.style.transformOrigin = `${originPoint.x - rect.left}px ${originPoint.y - rect.top}px`;
    }

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.fromTo(
          [backdrop, dialog],
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: "none", onComplete: () => onOpened?.() }
        );
        return;
      }
      gsap
        .timeline({ onComplete: () => onOpened?.() })
        .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: "power1.out" }, 0)
        .fromTo(
          dialog,
          originPoint
            ? { opacity: 0, scale: 0.08 }
            : { opacity: 0, scale: 0.94, y: 18 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: originPoint ? 0.6 : 0.75,
            ease: originPoint ? "power2.out" : "power3.out",
            clearProps: "transform",
          },
          0.08
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
      className={["scene-modal", overlayClassName].filter(Boolean).join(" ")}
      onPointerDown={(e) => {
        pointerDownOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pointerDownOnBackdrop.current) requestClose();
        pointerDownOnBackdrop.current = false;
      }}
    >
      <div ref={backdropRef} className="scene-modal__backdrop" aria-hidden="true" />

      <div
        ref={dialogRef}
        className={["scene-modal__dialog", dialogClassName].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={aria["aria-labelledby"]}
        aria-describedby={aria["aria-describedby"]}
        tabIndex={-1}
        onKeyDown={onDialogKeyDown}
      >
        {children}

        <button type="button" className="scene-modal__close" onClick={requestClose} aria-label="Fechar">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M3 3 13 13M13 3 3 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
