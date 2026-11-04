"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/lib/motion";
import SceneModal from "@/components/SceneModal/SceneModal";
import "./NoteModal.css";

/**
 * "Nota" de papel — conteúdo do quadro de recados e do relógio. Os dois
 * abrem com o efeito de zoom-a-partir-do-objeto (ver SceneModal `originPoint`)
 * e mostram uma lista de campos, estilo bilhete escrito à mão numa folha de
 * papel de carta de verdade — composição "mesa de trabalho" (papel + clipe
 * + adesivos, ver conversa "deixar bem atrativo visualmente"), com assets
 * reais do scrapbook da Jules (não CSS fingindo textura).
 *
 * Os campos (`fields`) vêm de fora (ver Quarto.tsx) — números reais do
 * Instagram da Jules (atualizados em 04/11/2026), não mais placeholder.
 *
 * Sequência de entrada (a pedido: "animar os textos do título... depois
 * que abre o papel rosa", "o gráfico tb deve ter uma animação"):
 *  1. o `SceneModal` termina a abertura (zoom a partir do objeto) e avisa
 *     via `onOpened`;
 *  2. só então o título começa a ser digitado letra por letra (mesma
 *     técnica do convite da porta, ver `DoorInvite.tsx`);
 *  3. quando o título termina de digitar, o gráfico de rosca (se houver)
 *     desenha as fatias uma depois da outra, e a grade de métricas some
 *     em cascata (ver `useRevealOnce` abaixo, usado pelos dois).
 * Título completo sempre disponível pra leitor de tela via `.sr-only`
 * (não espera a digitação) — ver `note-modal__title`.
 */

const TYPE_MS = 36; // por caractere, do título

/** dispara `onReveal` uma única vez, assim que `ready` vira `true` — usado
 * tanto pelo gráfico quanto pela grade de métricas pra começar a animar
 * no mesmo instante (quando o título termina de digitar), sem repetir se
 * o efeito rodar de novo por qualquer outro motivo. */
function useRevealOnce(ready: boolean, onReveal: () => void) {
  const firedRef = useRef(false);
  useEffect(() => {
    if (!ready || firedRef.current) return;
    firedRef.current = true;
    onReveal();
    // `onReveal` é um callback fechado no momento do disparo (mesmo padrão
    // de outros efeitos "só uma vez" no projeto) — não precisa estar nas deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
}

export type NoteField = {
  /** o número em destaque, grande (ex. "19,9 mil") */
  value: string;
  /** nome curto da métrica, embaixo do número (ex. "seguidores") */
  label: string;
  /** legenda menor/mais clara, com o contexto (ex. "no Instagram") —
   * é aqui que entra qualquer período ("em 30 dias"), não abreviado
   * dentro do número pra não poluir. */
  description?: string;
};

/** uma fatia do gráfico de rosca — `value` em pontos percentuais (a soma
 * não precisa dar 100; o que falta vira a trilha cinza de fundo) */
export type NoteChartSlice = {
  label: string;
  value: number;
  color?: string;
};

export type NoteChart = {
  ariaLabel: string;
  slices: NoteChartSlice[];
};

const CHART_COLORS = ["var(--burgundy)", "var(--pink)", "var(--muted)"];

/**
 * Gráfico de rosca em SVG puro (sem lib de gráfico) — `pathLength={100}`
 * deixa trabalhar direto em pontos percentuais, sem calcular a
 * circunferência real do círculo. `strokeDashoffset={25 - acumulado}`
 * desloca o início de cada fatia do "3 horas" (padrão do SVG) pro "12
 * horas" (25 = um quarto de 100) e encadeia as fatias em sequência.
 *
 * `reveal`: só começa a desenhar (fatia por fatia, `stroke-dasharray`
 * crescendo de "0 100" até o valor final) quando vira `true` — ver
 * `useRevealOnce` em `NoteModal`. Com movimento reduzido, nasce direto no
 * estado final (os `<circle>` já têm o `strokeDasharray` certo no JSX;
 * só não disparamos o tween por cima).
 */
function NoteChartDonut({ ariaLabel, slices, reveal }: NoteChart & { reveal: boolean }) {
  const size = 72;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  const reduced = usePrefersReducedMotion();
  const ringsRef = useRef<Array<SVGCircleElement | null>>([]);

  // acumula sem reatribuir variável (o lint do React Compiler reclama de
  // `let` reatribuído dentro de .map() durante a renderização) — cada
  // passo devolve um novo estado só com o próximo item anexado.
  const arcs = slices.reduce<{ items: Array<NoteChartSlice & { pct: number; dashoffset: number; color: string }>; acc: number }>(
    (state, s, i) => {
      const pct = (s.value / total) * 100;
      const dashoffset = 25 - state.acc;
      const color = s.color ?? CHART_COLORS[i % CHART_COLORS.length];
      return { items: [...state.items, { ...s, pct, dashoffset, color }], acc: state.acc + pct };
    },
    { items: [], acc: 0 }
  ).items;

  useRevealOnce(reveal && !reduced, () => {
    arcs.forEach((a, i) => {
      const el = ringsRef.current[i];
      if (!el) return;
      gsap.fromTo(
        el,
        { attr: { "stroke-dasharray": "0 100" } },
        { attr: { "stroke-dasharray": `${a.pct} ${100 - a.pct}` }, duration: 0.8, delay: i * 0.18, ease: "power2.out" }
      );
    });
  });

  return (
    <div className="note-modal__chart">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={ariaLabel}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(28, 20, 13, 0.1)" strokeWidth={stroke} />
        {arcs.map((a, i) => (
          <circle
            key={a.label}
            ref={(el) => {
              ringsRef.current[i] = el;
            }}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            pathLength={100}
            strokeDasharray={`${a.pct} ${100 - a.pct}`}
            strokeDashoffset={a.dashoffset}
          />
        ))}
      </svg>
      <ul className="note-modal__chart-legend">
        {arcs.map((a) => (
          <li key={a.label}>
            <span className="note-modal__chart-dot" aria-hidden="true" style={{ background: a.color }} />
            {a.label} <b>{a.value}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = {
  onClosed: () => void;
  originPoint?: { x: number; y: number } | null;
  title: string;
  fields: NoteField[];
  titleId: string;
  /** gráfico opcional (ex. distribuição de gênero no mural) — entra entre o título e a grade de métricas */
  chart?: NoteChart;
};

export default function NoteModal({ onClosed, originPoint, title, fields, titleId, chart }: Props) {
  const reduced = usePrefersReducedMotion();
  const fieldsRef = useRef<HTMLDListElement>(null);
  const [opened, setOpened] = useState(false);
  const [typed, setTyped] = useState(0);
  const typingDone = typed >= title.length;

  // título digitado letra por letra, só depois que o papel termina de abrir
  // (`onOpened`, ver SceneModal.tsx). Some com a grade de métricas ANTES
  // dela aparecer de verdade — nesse instante o papel ainda tá no fim do
  // zoom de abertura, então fica imperceptível; ela só é revelada de fato
  // no `useRevealOnce` abaixo, quando a digitação termina.
  useEffect(() => {
    if (!opened) return;
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com o papel ter terminado de abrir (onOpened), não com props/estado do próprio componente; mesmo padrão de DoorInvite.tsx
      setTyped(title.length);
      return;
    }
    // esconde a grade ANTES do título começar a digitar — só quando vamos
    // mesmo animar a revelação dela depois (ver `useRevealOnce` abaixo);
    // com movimento reduzido ela nunca é escondida, então não precisa de
    // revelação nenhuma.
    if (fieldsRef.current) gsap.set(fieldsRef.current.children, { opacity: 0, y: 14 });
    setTyped(0);
    const id = window.setInterval(() => {
      setTyped((n) => {
        if (n >= title.length) {
          window.clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, TYPE_MS);
    return () => window.clearInterval(id);
  }, [opened, reduced, title]);

  // a grade de métricas some em cascata assim que o título termina de
  // digitar — ao mesmo tempo em que o gráfico (se houver) começa a
  // desenhar as fatias (ver `reveal` no NoteChartDonut).
  useRevealOnce(typingDone && !reduced, () => {
    const el = fieldsRef.current;
    if (!el) return;
    gsap.to(el.children, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" });
  });

  return (
    <SceneModal
      onClosed={onClosed}
      dialogClassName="note-modal"
      aria-labelledby={titleId}
      originPoint={originPoint}
      onOpened={() => setOpened(true)}
    >
      <div className="note-modal__sheet">
        {/* o papel define o formato (borda recortada à mão) — o resto é
            decoração por cima, nenhum é informativo, por isso aria-hidden */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/notes/note-paper.png" alt="" aria-hidden="true" draggable={false} className="note-modal__paper" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/notes/note-clip.png" alt="" aria-hidden="true" draggable={false} className="note-modal__clip" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/notes/note-star.png" alt="" aria-hidden="true" draggable={false} className="note-modal__star" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/notes/note-washi.png" alt="" aria-hidden="true" draggable={false} className="note-modal__washi" />

        <div className="note-modal__content">
          <h2 id={titleId} className="note-modal__title">
            <span className="sr-only">{title}</span>
            <span aria-hidden="true">
              {title.slice(0, typed)}
              <span className={`note-modal__title-caret${typingDone ? " is-done" : ""}`} />
            </span>
          </h2>
          {chart && <NoteChartDonut ariaLabel={chart.ariaLabel} slices={chart.slices} reveal={typingDone} />}
          <dl ref={fieldsRef} className="note-modal__fields">
            {fields.map((f) => (
              <div className="note-modal__field" key={f.label}>
                <dt>{f.value}</dt>
                <dd>
                  <p className="note-modal__field-label">{f.label}</p>
                  {f.description && <p className="note-modal__field-desc">{f.description}</p>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </SceneModal>
  );
}
