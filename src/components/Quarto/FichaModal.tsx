"use client";

import { useState, type FormEvent } from "react";
import SceneModal from "@/components/SceneModal/SceneModal";
import "./FichaModal.css";

/**
 * Ficha de interesse pra marcas — aberta pelo telefone do quarto.
 *
 * Frase de convite ("vamos criar algo juntas? ♡") resgatada do arco de
 * storytelling guardado em NOTES-conceito-scrollytelling.md (último beat:
 * "Let's create something together ♡" → Contato) — era o fecho do antigo
 * capítulo 3, reaproveitado aqui como convite direto pras marcas, no
 * lugar onde esse convite agora mora de verdade.
 *
 * Layout/campos inspirados num print que a Jules mandou: coluna da
 * esquerda com o convite + e-mail direto; coluna da direita com os campos
 * numerados (01 Formato, 02 Nicho, ... 07 Recado), formato e nicho como
 * chips de seleção múltipla.
 *
 * ENVIO — sem backend/banco de dados neste projeto (site estático), então
 * nada fica armazenado em lugar nenhum por padrão:
 *  - se `NEXT_PUBLIC_FICHA_FORM_ENDPOINT` estiver configurado (ex. um
 *    formulário do Formspree), envia por `fetch` e mostra confirmação na
 *    própria tela, sem sair da página;
 *  - sem essa variável (o padrão, direto da caixa), abre o aplicativo de
 *    e-mail da MARCA com tudo já preenchido, endereçado pra
 *    literajules@gmail.com — a Jules recebe a ficha direto na caixa de
 *    entrada dela, sem precisar de nenhuma conta/serviço extra.
 */

const TO_EMAIL = "literajules@gmail.com";
const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FICHA_FORM_ENDPOINT;

const FORMATOS = ["Reels", "TikTok", "YouTube", "Stories", "UGC", "Evento ou viagem"];
const NICHOS = ["Autocuidado", "Rotina", "Moda", "Decor"];

type FichaData = {
  formatos: string[];
  nichos: string[];
  nome: string;
  marca: string;
  email: string;
  prazo: string;
  recado: string;
};

const EMPTY: FichaData = { formatos: [], nichos: [], nome: "", marca: "", email: "", prazo: "", recado: "" };

type Status = "idle" | "sending" | "sent" | "error" | "mailto";

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function buildMailto(data: FichaData) {
  const subject = `Proposta de parceria${data.marca ? ` — ${data.marca}` : ""}`;
  const body = [
    `Nome: ${data.nome}`,
    `Marca: ${data.marca}`,
    `E-mail: ${data.email}`,
    `Formato: ${data.formatos.join(", ") || "—"}`,
    `Nicho: ${data.nichos.join(", ") || "—"}`,
    `Prazo: ${data.prazo || "—"}`,
    "",
    "Recado:",
    data.recado || "—",
  ].join("\n");
  return `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const STATUS_MESSAGE: Record<Status, string | null> = {
  idle: null,
  sending: "enviando…",
  sent: "chegou! te respondo rapidinho ♡",
  error: `não consegui enviar — escreve direto pra ${TO_EMAIL}, por favor?`,
  mailto: `abri seu e-mail com tudo prontinho, só clicar em enviar! se não abriu nada, escreve direto pra ${TO_EMAIL}.`,
};

export default function FichaModal({ onClosed }: { onClosed: () => void }) {
  const [data, setData] = useState<FichaData>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");

  const set = <K extends keyof FichaData>(key: K, value: FichaData[K]) => setData((cur) => ({ ...cur, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (FORM_ENDPOINT) {
      setStatus("sending");
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            ...data,
            formatos: data.formatos.join(", "),
            nichos: data.nichos.join(", "),
            // campo especial do Formspree: define o assunto do e-mail de
            // notificação que a Jules recebe — mesmo texto do fallback de
            // mailto (`buildMailto`), só que aqui o Formspree que lê.
            _subject: `Proposta de parceria${data.marca ? ` — ${data.marca}` : ""}`,
          }),
        });
        setStatus(res.ok ? "sent" : "error");
      } catch {
        setStatus("error");
      }
      return;
    }

    // sem endpoint configurado: e-mail já endereçado pra Jules, pronto pra enviar
    window.location.href = buildMailto(data);
    setStatus("mailto");
  };

  return (
    <SceneModal onClosed={onClosed} dialogClassName="ficha-modal" aria-labelledby="ficha-modal-title">
      {/* decoração — clipe reaproveitado do bilhete do quadro/relógio (ver
          NoteModal, mesma "mesa de trabalho"); pasta pontilhada + postcard
          vintage são próprios desta ficha, do scrapbook da Jules (ver
          comentário em FichaModal.css). Puramente visual. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/notes/note-clip.png" alt="" aria-hidden="true" draggable={false} className="ficha-modal__clip" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/notes/sticker-folder-bolinha.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="ficha-modal__folder-sticker"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/notes/sticker-postcard.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="ficha-modal__postcard-sticker"
      />

      <div className="ficha-modal__scroll">
        <div className="ficha-modal__grid">
          <div className="ficha-modal__intro">
            <p className="ficha-modal__sign">alô? · ficha de interesse</p>
            <h2 id="ficha-modal-title" className="ficha-modal__title">
              vamos criar algo juntas? ♡
            </h2>
            <p className="ficha-modal__text">Me conta da campanha que eu te respondo logo logo.</p>
            <p className="ficha-modal__text">
              Ou escreve direto pra{" "}
              <a className="ficha-modal__email" href={`mailto:${TO_EMAIL}`}>
                {TO_EMAIL}
              </a>
            </p>

            {/* mídia kit "de bolso" — abre a página /media-kit numa aba
                nova (ver MediaKitPage.tsx); lá tem o botão que chama
                `window.print()` pra "salvar como PDF" de verdade. */}
            <a className="ficha-modal__kit-download" href="/media-kit" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path
                  d="M8 1.5v8.3M4.6 6.6 8 10l3.4-3.4M2.5 12.5h11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              baixar mídia kit (PDF)
            </a>
          </div>

          <form className="ficha-modal__form" onSubmit={handleSubmit}>
            <fieldset className="ficha-modal__field">
              <legend>
                <span className="ficha-modal__num">01</span> Formato
              </legend>
              <div className="ficha-modal__chips">
                {FORMATOS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`ficha-modal__chip${data.formatos.includes(f) ? " is-on" : ""}`}
                    aria-pressed={data.formatos.includes(f)}
                    onClick={() => set("formatos", toggle(data.formatos, f))}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="ficha-modal__field">
              <legend>
                <span className="ficha-modal__num">02</span> Nicho
              </legend>
              <div className="ficha-modal__chips">
                {NICHOS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`ficha-modal__chip${data.nichos.includes(n) ? " is-on" : ""}`}
                    aria-pressed={data.nichos.includes(n)}
                    onClick={() => set("nichos", toggle(data.nichos, n))}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="ficha-modal__field">
              <span>
                <span className="ficha-modal__num">03</span> Nome
              </span>
              <input
                required
                type="text"
                placeholder="Seu nome"
                value={data.nome}
                onChange={(e) => set("nome", e.target.value)}
              />
            </label>

            <label className="ficha-modal__field">
              <span>
                <span className="ficha-modal__num">04</span> Marca
              </span>
              <input
                required
                type="text"
                placeholder="Empresa ou marca"
                value={data.marca}
                onChange={(e) => set("marca", e.target.value)}
              />
            </label>

            <label className="ficha-modal__field">
              <span>
                <span className="ficha-modal__num">05</span> E-mail
              </span>
              <input
                required
                type="email"
                placeholder="seu@email.com"
                value={data.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </label>

            <label className="ficha-modal__field">
              <span>
                <span className="ficha-modal__num">06</span> Prazo
              </span>
              <input
                type="text"
                placeholder="Data, se tiver"
                value={data.prazo}
                onChange={(e) => set("prazo", e.target.value)}
              />
            </label>

            <label className="ficha-modal__field ficha-modal__field--recado">
              <span>
                <span className="ficha-modal__num">07</span> Recado
              </span>
              <textarea
                placeholder="Conta um pouco da campanha ou da ideia"
                rows={3}
                value={data.recado}
                onChange={(e) => set("recado", e.target.value)}
              />
            </label>

            <button type="submit" className="ficha-modal__submit" disabled={status === "sending"}>
              {status === "sending" ? "enviando…" : "enviar ficha"}
            </button>

            {STATUS_MESSAGE[status] && (
              <p className={`ficha-modal__status ficha-modal__status--${status}`} role="status" aria-live="polite">
                {STATUS_MESSAGE[status]}
              </p>
            )}
          </form>
        </div>
      </div>
    </SceneModal>
  );
}

