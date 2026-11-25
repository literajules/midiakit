"use client";
import { useLanguage } from "@/components/Language";

import { useEffect, useRef, useState, type FormEvent } from "react";
import SceneModal from "@/components/SceneModal/SceneModal";
import "./Guestbook.css";

type Sticker = { name: string; x: number; y: number; angle: number };
type Entry = {
  id: string;
  message: string;
  signature: string;
  ink?: string;
  selfie: string | null;
  stickers: (Sticker | string)[];
  approved: boolean;
};

const inks = [
  { color: "#702b42", pt: "Vinho", en: "Burgundy" },
  { color: "#303e69", pt: "Azul", en: "Blue" },
  { color: "#342b28", pt: "Grafite", en: "Charcoal" },
  { color: "#31594c", pt: "Verde", en: "Green" },
  { color: "#64466f", pt: "Ameixa", en: "Plum" },
];

const storageKey = "literajules-guestbook-preview";
const stickerRoot = "/journal-stickers/";

function Page({ entry, onMove }: {
  entry: Omit<Entry, "id" | "approved">;
  onMove?: (name: string, update: Partial<Sticker>) => void;
}) {
  const { t } = useLanguage();
  const [active, setActive] = useState<string | null>(null);
  const drag = useRef<{ pointer: number; dx: number; dy: number } | null>(null);

  return (
    <article className="guestbook-page" style={{ color: inks.find(({ color }) => color === entry.ink)?.color }}>
      {entry.selfie && <span className="guestbook-selfie">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entry.selfie} alt="Selfie de quem deixou o recado" />
      </span>}
      <p>{entry.message || "Seu recado fica aqui."}</p>
      {entry.signature && <footer>com carinho, {entry.signature}</footer>}
      <div className="guestbook-decoration">
        {entry.stickers.map((item, index) => {
          const sticker = typeof item === "string" ? { name: item, x: 14 + index * 22, y: 82, angle: 0 } : item;
          const style = { left: sticker.x + "%", top: sticker.y + "%", rotate: sticker.angle + "deg" };
          // eslint-disable-next-line @next/next/no-img-element
          const image = <img src={stickerRoot + sticker.name} alt="" draggable={false} />;
          if (!onMove) return <span className="guestbook-sticker" key={sticker.name} style={style}>{image}</span>;
          return <div className="guestbook-sticker-anchor" key={sticker.name} style={{ left: style.left, top: style.top }} data-selected={active === sticker.name}>
          <button className="guestbook-sticker" type="button" style={{ rotate: style.rotate }}
            aria-label={t("Mover sticker", "Move sticker") + " " + (index + 1)} aria-pressed={active === sticker.name}
            onFocus={() => setActive(sticker.name)}
            onClick={() => setActive(sticker.name)}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              const target = event.currentTarget;
              const rect = target.getBoundingClientRect();
              drag.current = { pointer: event.pointerId, dx: event.clientX - (rect.left + rect.width / 2), dy: event.clientY - (rect.top + rect.height / 2) };
              target.setPointerCapture(event.pointerId);
              setActive(sticker.name);
            }}
            onLostPointerCapture={() => { drag.current = null; }}
            onPointerMove={(event) => {
              const target = event.currentTarget;
              const start = drag.current;
              if (start?.pointer !== event.pointerId || !target.hasPointerCapture(event.pointerId)) return;
              const bounds = target.closest(".guestbook-decoration")!.getBoundingClientRect();
              const limit = (value: number, inset: number) => Math.max(inset, Math.min(100 - inset, value));
              onMove(sticker.name, {
                x: limit((event.clientX - start.dx - bounds.left) / bounds.width * 100, 30 / bounds.width * 100),
                y: limit((event.clientY - start.dy - bounds.top) / bounds.height * 100, 30 / bounds.height * 100),
              });
            }}
            onKeyDown={(event) => {
              const steps: Record<string, [number, number]> = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -4], ArrowDown: [0, 4] };
              const step = steps[event.key];
              if (!step) return;
              event.preventDefault();
              onMove(sticker.name, { x: Math.max(10, Math.min(90, sticker.x + step[0])), y: Math.max(15, Math.min(85, sticker.y + step[1])) });
            }}>{image}</button>
          {active === sticker.name && <button
            className="guestbook-sticker-rotate"
            type="button"
            data-side={sticker.x > 65 ? "left" : "right"}
            aria-label={t("Girar sticker", "Rotate sticker")}
            onClick={() => onMove(sticker.name, { angle: (sticker.angle + 15) % 360 })}
          ><span aria-hidden="true">↻</span></button>}
          </div>;
        })}
      </div>
    </article>
  );
}

function paginate(entries: Entry[]) {
  const pages: Entry[][] = [];
  for (const entry of entries) {
    const last = pages.at(-1);
    const compact = (item: Entry) => !item.selfie && item.message.length <= 170 && item.message.split("\n").length <= 4;
    if (last?.length === 1 && compact(last[0]) && compact(entry)) last.push(entry);
    else pages.push([entry]);
  }
  return pages;
}

export default function Guestbook({ selfie, onClosed }: { selfie: string | null; onClosed: () => void }) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stickers, setStickers] = useState<string[]>([]);
  const [tab, setTab] = useState<"read" | "write" | "admin">(selfie ? "write" : "read");
  const [page, setPage] = useState(0);
  const [stickersOpen, setStickersOpen] = useState(false);
  const [promptIndex, setPromptIndex] = useState(-1);
  const messageField = useRef<HTMLTextAreaElement>(null);
  const prompts = [
    t("uma coisinha boa do meu dia foi…", "one little good thing about my day was…"),
    t("passei aqui pra te contar que…", "i stopped by to tell you that…"),
    t("ultimamente tenho gostado de…", "lately i’ve been enjoying…"),
  ];
  const [message, setMessage] = useState("");
  const [ink, setInk] = useState(inks[0].color);
  const [signature, setSignature] = useState("");
  const [includePhoto, setIncludePhoto] = useState(false);
  const [selection, setSelection] = useState<Sticker[]>([]);
  const [notice, setNotice] = useState("");
  const [admin, setAdmin] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const task = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) setEntries(JSON.parse(saved));
      } catch {
        setNotice("Não foi possível carregar os recados deste navegador.");
      }
    });
    const controller = new AbortController();
    fetch(stickerRoot + "index.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("stickers");
        return response.json() as Promise<string[]>;
      })
      .then(setStickers)
      .catch(() => {
        if (!controller.signal.aborted) setNotice("Os stickers não carregaram. Você ainda pode escrever um recado.");
      });
    return () => {
      cancelAnimationFrame(task);
      controller.abort();
    };
  }, []);

  const pages = paginate(entries.filter((entry) => entry.approved));
  const spreads = Math.ceil(pages.length / 2);
  const index = Math.min(page, Math.max(0, spreads - 1));
  const draft = { message, signature, ink, selfie: includePhoto ? selfie : null, stickers: selection };

  function save(next: Entry[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setEntries(next);
      return true;
    } catch {
      setNotice("Não foi possível salvar neste navegador. Tente um recado sem foto.");
      return false;
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    if (save([{ ...draft, message: message.trim(), signature: signature.trim(), id: crypto.randomUUID(), approved: false }, ...entries])) {
      setMessage("");
      setSignature("");
      setSelection([]);
      setIncludePhoto(false);
      setNotice(t("Recado salvo como pendente neste navegador.", "Note saved as pending in this browser."));
      setTab("read");
    }
  }

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await fetch("/api/journal-admin", { method: "POST", body: JSON.stringify({ password }) });
      if (!response.ok) {
        setNotice(response.status === 503 ? t("O acesso de admin ainda precisa ser configurado.", "Admin access still needs to be set up.") : t("Senha incorreta.", "Incorrect password."));
        return;
      }
      setAdmin(true);
      setNotice("");
    } catch {
      setNotice(t("Não foi possível validar o acesso.", "Couldn’t verify access."));
    } finally {
      setPassword("");
    }
  }

  function toggleSticker(name: string) {
    setSelection((current) => current.some((item) => item.name === name)
      ? current.filter((item) => item.name !== name)
      : [...current, { name, x: 14 + current.length * 22, y: 81, angle: 0 }]);
  }

  function moveSticker(name: string, update: Partial<Sticker>) {
    setSelection((current) => current.map((item) => item.name === name ? { ...item, ...update } : item));
  }

  return (
    <SceneModal onClosed={onClosed} dialogClassName="guestbook" aria-labelledby="guestbook-title">
      <h2 id="guestbook-title" className="guestbook-sr-only">{t("Meu journal", "My journal")}</h2>
      <nav className="guestbook-tabs" aria-label={t("Livro de visitas", "Guestbook")}>
        {tab !== "read" && <button type="button" onClick={() => setTab("read")}>{t("folhear", "browse")}</button>}
        {tab !== "write" && <button type="button" onClick={() => setTab("write")}>{t("deixar um recado", "leave a note")}</button>}
        {tab !== "admin" && <button type="button" onClick={() => setTab("admin")}>admin</button>}
      </nav>
      <div className="guestbook-spread">
        {tab === "read" && [0, 1].map((side) => (
          <div className="guestbook-paper" key={side}>
            {pages[index * 2 + side]?.map((entry) => <Page entry={entry} key={entry.id} />)}
            {side === 0 && !pages.length && <p className="guestbook-page">{t("Ainda não há recados aprovados.", "No approved notes yet.")}</p>}
          </div>
        ))}
        {tab === "write" && <>
          <div className="guestbook-paper guestbook-paper--draft">
            {selection.length > 0 && <p className="guestbook-sticker-tip">{t("Arraste o sticker. Toque no ↻ para girar.", "Drag the sticker. Tap ↻ to rotate it.")}</p>}
            <Page entry={draft} onMove={moveSticker} />
          </div>
          <div className="guestbook-paper">
        <form className="guestbook-compose" onSubmit={submit}>
          <h3>{t("deixe um recado", "leave a note")}</h3>
          <label>
            <span className="guestbook-sr-only">{t("Seu recado", "Your note")}</span>
            <textarea ref={messageField} required maxLength={500} rows={4} value={message}
              style={{ color: ink }} placeholder={t("escreva alguma coisa…", "write something…")}
              onChange={(event) => setMessage(event.target.value)} />
          </label>
          <div className="guestbook-signature-row">
            <label>
              <span className="guestbook-sr-only">{t("Assinatura (opcional)", "Signature (optional)")}</span>
              <input maxLength={40} value={signature} style={{ color: ink }}
                placeholder={t("seu nome (opcional)", "your name (optional)")}
                onChange={(event) => setSignature(event.target.value)} />
            </label>
            <span>{message.length}/500</span>
          </div>
          <div className="guestbook-inks" role="group" aria-label={t("Cor da tinta", "Ink color")}>
            {inks.map(({ color, pt, en }) => (
              <button key={color} type="button" aria-label={t(pt, en)} aria-pressed={ink === color}
                style={{ backgroundColor: color }} onClick={() => setInk(color)} />
            ))}
          </div>
          {selfie && <label className="guestbook-consent">
            <input type="checkbox" checked={includePhoto} onChange={(event) => setIncludePhoto(event.target.checked)} />
            {t("Quero incluir minha selfie e autorizo que ela apareça com o recado após aprovação.", "Include my selfie and allow it to appear with my note after approval.")}
          </label>}

          <div className="guestbook-prompt">
            <button type="button" onClick={() => setPromptIndex((index) => (index + 1) % prompts.length)}>{t("sem ideia?", "need an idea?")}</button>
            {promptIndex >= 0 && <div>
              <p aria-live="polite">{prompts[promptIndex]}</p>
              {!message.trim() && <button type="button" onClick={() => {
                setMessage(prompts[promptIndex] + " ");
                messageField.current?.focus();
              }}>{t("usar sugestão", "use prompt")}</button>}
            </div>}
          </div>
          <button className="guestbook-send" type="submit" disabled={!message.trim()}>{t("enviar recado", "send note")}</button>
        </form>
          </div>
          <button className="guestbook-sticker-tab" type="button" aria-expanded={stickersOpen}
            aria-controls="guestbook-sticker-sheet" onClick={() => setStickersOpen((open) => !open)}>stickers ♡</button>
          <fieldset className="guestbook-sticker-sheet" id="guestbook-sticker-sheet" hidden={!stickersOpen}>
            <legend>{t("Cartela de stickers", "Sticker sheet")}</legend>
            <div className="guestbook-stickers">
              {stickers.map((name, i) => (
                <button key={name} type="button" aria-label={"Sticker " + (i + 1)} aria-pressed={selection.some((item) => item.name === name)}
                  disabled={selection.length >= 4 && !selection.some((item) => item.name === name)} onClick={() => toggleSticker(name)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stickerRoot + name} alt="" />
                </button>
              ))}
            </div>
          </fieldset>
        </>}
        {tab === "admin" && <div className="guestbook-paper guestbook-paper--admin">
      {tab === "admin" && !admin && <form onSubmit={unlock}>
        <label>{t("Senha de admin", "Admin password")}<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <button type="submit">{t("entrar", "sign in")}</button>
      </form>}
      {tab === "admin" && admin && (
        <section aria-label={t("Moderação de teste", "Test moderation")}>
          {entries.length === 0 && <p>{t("Receba seu primeiro recado para testar a moderação.", "Submit a note to try moderation.")}</p>}
          {entries.map((entry) => (
            <div className="guestbook-review" key={entry.id}>
              <Page entry={entry} />
              <p>{entry.approved ? t("Aprovado", "Approved") : t("Pendente", "Pending")}</p>
              {!entry.approved && <button type="button" onClick={() => save(entries.map((item) => item.id === entry.id ? { ...item, approved: true } : item))}>{t("aprovar", "approve")}</button>}
              <button type="button" onClick={() => save(entries.filter((item) => item.id !== entry.id))}>{entry.approved ? t("excluir recado publicado", "delete published note") : t("recusar", "decline")}</button>
            </div>
          ))}
        </section>
      )}
        </div>}
        {tab === "read" && spreads > 1 && <div className="guestbook-pages">
          <button type="button" aria-label={t("Página anterior", "Previous page")} disabled={index === 0} onClick={() => setPage(index - 1)}>←</button>
          <span>{index + 1} / {spreads}</span>
          <button type="button" aria-label={t("Próxima página", "Next page")} disabled={index === spreads - 1} onClick={() => setPage(index + 1)}>→</button>
        </div>}
      </div>
      {notice && <p className="guestbook-notice" role="status">{notice}</p>}
    </SceneModal>
  );
}
