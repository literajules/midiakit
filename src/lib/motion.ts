"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* ---------- matemática das animações ---------- */

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export const smoothstep = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/** Progresso suavizado de `p` dentro da janela [a, b] (0 antes de a, 1 depois de b). */
export const ramp = (p: number, a: number, b: number) => smoothstep((p - a) / (b - a));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type RGB = [number, number, number];

export const mixRGB = (a: RGB, b: RGB, t: number) =>
  `rgb(${Math.round(lerp(a[0], b[0], t))}, ${Math.round(lerp(a[1], b[1], t))}, ${Math.round(
    lerp(a[2], b[2], t)
  )})`;

/* ---------- preferência de movimento reduzido ---------- */

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false
  );
}

/* ---------- dispositivo sem hover (touch) ---------- */

const NO_HOVER_QUERY = "(hover: none)";

function subscribeNoHover(onChange: () => void) {
  const mq = window.matchMedia(NO_HOVER_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** true em dispositivos sem hover (touch) — pra mostrar alternativas de acesso. */
export function useNoHover() {
  return useSyncExternalStore(
    subscribeNoHover,
    () => window.matchMedia(NO_HOVER_QUERY).matches,
    () => false
  );
}

/* ---------- progresso do scroll de uma seção ---------- */

/**
 * Progresso (0 → 1) do scroll dentro de uma seção, já suavizado.
 *
 * O GSAP só aplica o `scrub` (a suavização) quando existe uma animação ligada
 * ao ScrollTrigger. Por isso o progresso passa por um objeto "proxy" animado:
 * assim cada seção acompanha o scroll com um pequeno atraso elástico, em vez
 * de pular de quadro em quadro. Com movimento reduzido, o progresso é direto.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  { start = "top top", end = "bottom bottom", smooth = 0.6 } = {}
) {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    const proxy = { p: 0 };
    const tween = gsap.to(proxy, {
      p: 1,
      ease: "none",
      scrollTrigger: { trigger: el, start, end, scrub: reduced ? true : smooth },
      onUpdate: () => setProgress(proxy.p),
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ref, start, end, smooth, reduced]);

  return progress;
}

/* ---------- tamanho de um elemento ---------- */

/** Largura/altura atuais de um elemento (atualiza quando ele muda de tamanho). */
export function useElementSize(
  ref: RefObject<HTMLElement | null>,
  fallback = { w: 0, h: 0 }
) {
  const [size, setSize] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
