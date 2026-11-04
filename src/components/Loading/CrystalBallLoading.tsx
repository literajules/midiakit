"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";
import "./CrystalBallLoading.css";

/**
 * Loading inicial — bola de cristal + contagem de 1 a 100 — como um
 * overlay de tela cheia (`position: fixed`) por cima do resto do site: o
 * quarto já está montado e visível por baixo desde o primeiro instante
 * (sem precisar de nenhum scroll, automático ou manual, pra "revelar"
 * nada) — essa tela só aparece/desaparece sozinha conforme o próprio
 * carregamento avança.
 *
 * Fases (controladas por estado, não por posição de rolagem):
 *  1. "contando" (0→100%) — só a contagem.
 *  2. "pronta" (`ready`) — contagem chegou a 100%, depois de um pequeno
 *     respiro.
 *  3. "saindo" (`leaving`) — clarão + boost de brilho na bola (mesmo
 *     tratamento visual de antes).
 *  4. "escondendo" (`hiding`) — a tela inteira esmaece (opacidade, CSS).
 *  5. "sumiu" (`gone`) — desmonta de vez (retorna `null`).
 *
 * `minDuration`: a contagem não "pisca" rápido demais numa conexão veloz
 * porque sempre conta em ~2,2s, independente de quão rápido a página
 * carregou de verdade.
 *
 * `prefers-reduced-motion`: pula a cerimônia inteira — a contagem já nasce
 * em 100% e a tela desmonta quase na hora, sem clarão/esmaecimento.
 *
 * Posições fixas (não aleatórias) nas estrelinhas de fundo: geradas em JS
 * com Math.random() dariam valores diferentes no servidor e no cliente
 * (mismatch de hidratação) — como são só "decoração", um punhado de
 * posições escolhidas à mão resolve sem esse risco.
 */

const TOTAL = 100;
const TICK_MS = 22; // ~2.2s pra contar até 100 em condições normais

/**
 * `threshold`: a partir de qual % do carregamento essa estrela "acende"
 * (começa a existir/piscar) — o céu vai se povoando conforme o progresso
 * sobe, em vez de todas piscarem juntas desde o primeiro quadro. Duas já
 * começam ligadas (o céu nunca é totalmente vazio) e a última só acende
 * perto de 100%, pra ficar "completo" bem quando a contagem termina.
 */
const STARS = [
  { top: "12%", left: "18%", delay: "0s", size: 3, threshold: 0 },
  { top: "22%", left: "78%", delay: "0.6s", size: 2, threshold: 0 },
  { top: "35%", left: "8%", delay: "1.4s", size: 2, threshold: 6 },
  { top: "8%", left: "52%", delay: "2.1s", size: 3, threshold: 14 },
  { top: "68%", left: "14%", delay: "0.9s", size: 2, threshold: 22 },
  { top: "76%", left: "84%", delay: "1.8s", size: 3, threshold: 30 },
  { top: "48%", left: "90%", delay: "0.3s", size: 2, threshold: 38 },
  { top: "60%", left: "60%", delay: "2.6s", size: 2, threshold: 48 },
  { top: "85%", left: "40%", delay: "1.1s", size: 3, threshold: 58 },
  { top: "18%", left: "35%", delay: "2.9s", size: 2, threshold: 68 },
  { top: "40%", left: "68%", delay: "1.6s", size: 2, threshold: 80 },
  { top: "90%", left: "70%", delay: "0.5s", size: 2, threshold: 92 },
];

export default function CrystalBallLoading() {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(reduced ? TOTAL : 0);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setCount((c) => {
        if (c >= TOTAL) {
          window.clearInterval(id);
          return TOTAL;
        }
        return c + 1;
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  // pequeno respiro depois de chegar a 100% antes de disparar a saída — dá
  // tempo de ver a contagem "fechar" antes da tela começar a sair.
  useEffect(() => {
    if (count < TOTAL || ready) return;
    const t = window.setTimeout(() => setReady(true), reduced ? 150 : 420);
    return () => window.clearTimeout(t);
  }, [count, ready, reduced]);

  // trava a rolagem da PÁGINA enquanto a tela de loading ainda existir —
  // mesma técnica de SceneModal/CozyMapModal (trava + devolve exatamente
  // como estava), só que aplicada ao documento inteiro. Sem scroll-reveal
  // nenhum pra destravar: só libera quando a tela some de vez (`gone`).
  useEffect(() => {
    if (gone) return;
    const root = document.documentElement;
    const prev = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
    return () => {
      root.style.overflow = prev.overflow;
      root.style.paddingRight = prev.paddingRight;
    };
  }, [gone]);

  // "pronta" → sai sozinha, sem gesto nenhum do visitante: clarão (`leaving`),
  // depois esmaece por completo (`hiding`), depois desmonta (`gone`). Sob
  // movimento reduzido, pula direto pra fora (sem clarão/esmaecimento).
  useEffect(() => {
    if (!ready) return;
    if (reduced) {
      const t = window.setTimeout(() => setGone(true), 150);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setLeaving(true), 60);
    return () => window.clearTimeout(t);
  }, [ready, reduced]);

  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setHiding(true), 550);
    return () => window.clearTimeout(t);
  }, [leaving]);

  useEffect(() => {
    if (!hiding) return;
    const t = window.setTimeout(() => setGone(true), 600);
    return () => window.clearTimeout(t);
  }, [hiding]);

  // 0 → 1, usado pra "a bola reage ao progresso" (aura/brilho) — ver CSS
  // (--crystal-progress).
  const progress = count / TOTAL;

  if (gone) return null;

  return (
    <div
      className={`crystal-loading${leaving ? " is-leaving" : ""}${hiding ? " is-hiding" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="crystal-loading__stars" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className={`crystal-loading__star${count >= s.threshold ? " is-on" : ""}`}
            style={{ top: s.top, left: s.left, animationDelay: s.delay, width: s.size, height: s.size }}
          />
        ))}
      </div>

      {/* ——— wordmark "escrito à mão": não troquei a arte (continua o PNG
          de sempre) — é um clip-path animado, com borda levemente
          inclinada (não uma linha reta) e uma pequena pausa no meio
          (entre "Litera" e "Jules"), simulando a pena levantando entre as
          duas palavras, mais um pontinho de brilho acompanhando a ponta da
          "pena" conforme ela avança. ——— */}
      <div className="crystal-loading__brand-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/wordmark.png" alt="Literajules" className="crystal-loading__brand" />
        <span className="crystal-loading__brand-pen" aria-hidden="true" />
      </div>

      {/* `--crystal-progress`: a aura e o brilho da bola crescem com ela
          (ver CrystalBallLoading.css) — a bola passa a "reagir" ao
          carregamento de verdade, em vez de só flutuar/pulsar num loop
          que não tem nada a ver com o número ao lado. */}
      <div className="crystal-loading__orb" style={{ "--crystal-progress": progress } as CSSProperties}>
        <span className="crystal-loading__aura" aria-hidden="true" />
        <span className="crystal-loading__progress-glow" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/loading/crystal-ball.png" alt="" aria-hidden="true" className="crystal-loading__ball" />
        {/* clarão no instante em que a tela começa a sair sozinha — a bola
            "revela" e, só então, o resto da cena esmaece (ver .is-leaving /
            .is-hiding). */}
        <span className={`crystal-loading__flash${leaving ? " is-on" : ""}`} aria-hidden="true" />
      </div>

      {/* some assim que chega a 100% (`ready`) — a partir daí a própria
          tela já está saindo sozinha (clarão → esmaecer → desmontar),
          sem precisar de nenhum convite/gesto do visitante. */}
      <p className={`crystal-loading__count${ready ? " is-done" : ""}`}>
        <span className="sr-only">Carregando, </span>
        {count}%
      </p>
    </div>
  );
}
