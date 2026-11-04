"use client";

import { useState } from "react";
import "./Receipt.css";

/**
 * O "recibo" — cartão de papel estilo nota fiscal de loja, baseado na
 * referência visual que a Jules mandou (receipt da "Julia's Café": cabeçalho
 * + linha de localização, divisórias de asterisco/igual, campos tipo
 * "bebendo/trabalhando em/lendo/ouvindo", rodapé de agradecimento, código de
 * barras, borda serrilhada na base). Puramente CSS — nenhum asset externo.
 *
 * A data/hora e o "pedido" usam a data atual do visitante. Este componente
 * só é montado depois de um clique (dentro de um SceneModal via portal),
 * nunca faz parte do HTML renderizado pelo servidor — por isso dá pra ler
 * `new Date()` direto no estado inicial, sem risco de mismatch de hidratação.
 */

export type ReceiptField = {
  label: string;
  value: string;
};

/**
 * Gera um `clip-path: polygon(...)` em zigue-zague nas 4 bordas — o corte
 * "tesoura de trilhar tecido" pedido, em vez do corte serrilhado que só
 * existia na base. `teethX`/`teethY` têm contagens diferentes de propósito
 * (o recibo é bem mais alto que largo; dentes do mesmo tamanho em pixel
 * exigem mais dentes no eixo mais longo). Os dois precisam ser PARES pra
 * cada canto cair exatamente na borda (sem isso, o entalhe "vaza" pro lado
 * errado no canto). `depth` é a profundidade do entalhe, em % do lado
 * correspondente (bem pequena — é um acabamento, não uma serra).
 */
function pinkingClipPath(teethX = 16, teethY = 24, depth = 2.2) {
  const stepX = 100 / teethX;
  const stepY = 100 / teethY;
  const pts: string[] = [];

  // topo: esquerda → direita
  for (let i = 0; i <= teethX; i++) pts.push(`${i * stepX}% ${i % 2 === 0 ? 0 : depth}%`);
  // direita: topo → base (o i=0 já foi coberto pelo último ponto do topo)
  for (let i = 1; i <= teethY; i++) pts.push(`${i % 2 === 0 ? 100 : 100 - depth}% ${i * stepY}%`);
  // base: direita → esquerda
  for (let i = 1; i <= teethX; i++) pts.push(`${100 - i * stepX}% ${i % 2 === 0 ? 100 : 100 - depth}%`);
  // esquerda: base → topo (sem repetir o canto topo-esquerdo, que fecha o polígono)
  for (let i = 1; i < teethY; i++) pts.push(`${i % 2 === 0 ? 0 : depth}% ${100 - i * stepY}%`);

  return `polygon(${pts.join(", ")})`;
}

const PINKING_CLIP_PATH = pinkingClipPath();

type Props = {
  shopName: string;
  location: string;
  subtitle: string;
  fields: ReceiptField[];
  thankYouLine?: string;
  comeAgainLine?: string;
};

function formatNow() {
  const now = new Date();
  const date = now.toLocaleDateString("pt-BR");
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  // número do pedido "do dia": determinístico a partir da data, só pra ter graça sem ficar aleatório à toa
  const order = String(
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  ).slice(-4);
  return { date, time, order };
}

export default function Receipt({
  shopName,
  location,
  subtitle,
  fields,
  thankYouLine = "OBRIGADA",
  comeAgainLine = "volte em breve",
}: Props) {
  const [stamp] = useState(formatNow);

  return (
    <div className="receipt" style={{ clipPath: PINKING_CLIP_PATH }}>
      <header className="receipt__header">
        <p className="receipt__shop">{shopName}</p>
        <p className="receipt__location">{location}</p>
      </header>

      <p className="receipt__rule receipt__rule--stars" aria-hidden="true">
        {"*".repeat(26)}
      </p>

      <p className="receipt__subtitle">{subtitle}</p>
      <p className="receipt__stamp">
        {stamp.date}  {stamp.time}
        <br />
        PEDIDO #{stamp.order}
      </p>

      <p className="receipt__rule receipt__rule--equals" aria-hidden="true">
        {"=".repeat(26)}
      </p>

      <dl className="receipt__fields">
        {fields.map((f, i) => (
          <div className="receipt__field" key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
            {i < fields.length - 1 && <hr className="receipt__divider" aria-hidden="true" />}
          </div>
        ))}
      </dl>

      <p className="receipt__rule receipt__rule--equals" aria-hidden="true">
        {"=".repeat(26)}
      </p>

      <footer className="receipt__footer">
        <p className="receipt__thanks">{thankYouLine}</p>
        <p className="receipt__again">{comeAgainLine}</p>
        <svg className="receipt__star" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M12 2.5l2.7 6.47 7 .58-5.33 4.6 1.63 6.85L12 17.3l-6 3.7 1.63-6.85L2.3 9.55l7-.58z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
        <div className="receipt__barcode" aria-hidden="true" />
        <p className="receipt__barcode-num">&quot;{stamp.order}&quot;</p>
      </footer>
    </div>
  );
}
