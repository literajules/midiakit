"use client";

import { useLanguage } from "@/components/Language";

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
const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FICHA_FORM_ENDPOINT?.trim() || "https://formspree.io/f/mljjznvg";

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
  sent: "chegou aqui! te respondo em breve ♡",
  error: `não consegui enviar — escreve direto pra ${TO_EMAIL}, por favor?`,
  mailto: `abri seu e-mail com tudo prontinho, só clicar em enviar! se não abriu nada, escreve direto pra ${TO_EMAIL}.`,
};

export default function FichaModal({ onClosed }: { onClosed: () => void }) {
  const { t } = useLanguage();
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

  if (status === "sent") {
    return (
      <SceneModal onClosed={onClosed} dialogClassName="ficha-modal ficha-modal--sent" aria-labelledby="ficha-modal-title">
        <div className="ficha-confirmation">
          <span className="ficha-confirmation__ziggy" aria-hidden="true" />

          <p id="ficha-modal-title" role="status" className="ficha-modal__title">{t(STATUS_MESSAGE.sent ?? "", "got it! I’ll get back to you soon ♡")}</p>
        </div>
      </SceneModal>
    );
  }

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
            <p className="ficha-modal__sign">{t("alô? · ficha de interesse", "hello? · collaboration inquiry")}</p>
            <h2 id="ficha-modal-title" className="ficha-modal__title">
              {t("vamos criar algo juntas? ♡", "let’s create something together ♡")}
            </h2>
            <p className="ficha-modal__text">{t("Me conta da campanha que eu te respondo logo logo.", "Tell me about your campaign and I’ll get back to you soon.")}</p>
            <p className="ficha-modal__text">
              {t("Ou escreve direto pra", "Or email me at")}{" "}
              <a className="ficha-modal__email" href={`mailto:${TO_EMAIL}`}>
                {TO_EMAIL}
              </a>
            </p>
          </div>

          <form className="ficha-modal__form" onSubmit={handleSubmit}>
            <fieldset className="ficha-modal__field">
              <legend>
                <span className="ficha-modal__num">01</span> {t("Formato", "Format")}
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
                    {t(f, f === "Evento ou viagem" ? "Event or travel" : f)}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="ficha-modal__field">
              <legend>
                <span className="ficha-modal__num">02</span> {t("Nicho", "Category")}
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
                    {t(n, ({ Autocuidado: "Self-care", Rotina: "Daily life", Moda: "Fashion", Decor: "Decor" } as Record<string, string>)[n] ?? n)}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="ficha-modal__field">
              <span>
                <span className="ficha-modal__num">03</span> {t("Nome", "Name")}
              </span>
              <input
                required
                type="text"
                placeholder={t("Seu nome", "Your name")}
                value={data.nome}
                onChange={(e) => set("nome", e.target.value)}
              />
            </label>

            <label className="ficha-modal__field">
              <span>
                <span className="ficha-modal__num">04</span> {t("Marca", "Brand")}
              </span>
              <input
                required
                type="text"
                placeholder={t("Empresa ou marca", "Company or brand")}
                value={data.marca}
                onChange={(e) => set("marca", e.target.value)}
              />
            </label>

            <label className="ficha-modal__field">
              <span>
                <span className="ficha-modal__num">05</span> {t("E-mail", "Email")}
              </span>
              <input
                required
                type="email"
                placeholder={t("seu@email.com", "you@example.com")}
                value={data.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </label>

            <label className="ficha-modal__field">
              <span>
                <span className="ficha-modal__num">06</span> {t("Prazo", "Timeline")}
              </span>
              <input
                type="text"
                placeholder={t("Data, se tiver", "Date, if you have one")}
                value={data.prazo}
                onChange={(e) => set("prazo", e.target.value)}
              />
            </label>

            <label className="ficha-modal__field ficha-modal__field--recado">
              <span>
                <span className="ficha-modal__num">07</span> {t("Recado", "Message")}
              </span>
              <textarea
                placeholder={t("Conta um pouco da campanha ou da ideia", "Tell me a little about the campaign or idea")}
                rows={3}
                value={data.recado}
                onChange={(e) => set("recado", e.target.value)}
              />
            </label>

            <button type="submit" className="ficha-modal__submit" disabled={status === "sending"}>
              {status === "sending" ? t("enviando…", "sending…") : t("enviar ficha", "send inquiry")}
            </button>

            {STATUS_MESSAGE[status] && (
              <p className={`ficha-modal__status ficha-modal__status--${status}`} role="status" aria-live="polite">
                {t(STATUS_MESSAGE[status] ?? "", status === "error" ? `I couldn’t send your message. Please email me at ${TO_EMAIL}.` : status === "sending" ? "Sending…" : "Your email draft is ready to send.")}
              </p>
            )}
          </form>
        </div>
      </div>
    </SceneModal>
  );
}

