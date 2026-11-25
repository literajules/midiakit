"use client";

import { useEffect, useState, type FormEvent } from "react";
import SceneModal from "@/components/SceneModal/SceneModal";
import "./Guestbook.css";

type Entry = {
  id: string;
  message: string;
  signature: string;
  selfie: string | null;
  stickers: string[];
  approved: boolean;
};

const storageKey = "literajules-guestbook-preview";
const stickerRoot = "/journal-stickers/";

function Page({ entry }: { entry: Omit<Entry, "id" | "approved"> }) {
  return (
    <article className="guestbook-page">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {entry.selfie && <img className="guestbook-selfie" src={entry.selfie} alt="Selfie de quem deixou o recado" />}
      <p>{entry.message || "Seu recado fica aqui."}</p>
      {entry.signature && <footer>com carinho, {entry.signature}</footer>}
      <div className="guestbook-decoration">
        {entry.stickers.map((name) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={name} src={stickerRoot + name} alt="" />
        ))}
      </div>
    </article>
  );
}

export default function Guestbook({ selfie, onClosed }: { selfie: string | null; onClosed: () => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stickers, setStickers] = useState<string[]>([]);
  const [tab, setTab] = useState<"read" | "write" | "admin">(selfie ? "write" : "read");
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [includePhoto, setIncludePhoto] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

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

  const published = entries.filter((entry) => entry.approved);
  const index = Math.min(page, Math.max(0, published.length - 1));
  const draft = { message, signature, selfie: includePhoto ? selfie : null, stickers: selection };

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
      setNotice("Recado salvo como pendente neste navegador.");
      setTab("read");
    }
  }

  function toggleSticker(name: string) {
    setSelection((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  return (
    <SceneModal onClosed={onClosed} dialogClassName="guestbook" aria-labelledby="guestbook-title">
      <header>
        <h2 id="guestbook-title">meu journal</h2>
        <p>livro de visitas do cozy corner</p>
      </header>
      <p className="guestbook-preview">Preview local. Os recados ficam neste navegador.</p>
      <nav aria-label="Livro de visitas">
        <button type="button" aria-pressed={tab === "read"} onClick={() => setTab("read")}>folhear</button>
        <button type="button" aria-pressed={tab === "write"} onClick={() => setTab("write")}>deixar um recado</button>
        <button type="button" aria-pressed={tab === "admin"} onClick={() => setTab("admin")}>testar moderação</button>
      </nav>
      {notice && <p role="status">{notice}</p>}
      {tab === "read" && (
        <>
          {published[index] ? <Page entry={published[index]} /> : <p className="guestbook-page">Ainda não há recados aprovados.</p>}
          {published.length > 0 && <div className="guestbook-pages">
            <button type="button" disabled={index === 0} onClick={() => setPage(index - 1)}>← anterior</button>
            <span>{index + 1} / {published.length}</span>
            <button type="button" disabled={index === published.length - 1} onClick={() => setPage(index + 1)}>próxima →</button>
          </div>}
        </>
      )}
      {tab === "write" && (
        <form onSubmit={submit}>
          <label>Seu recado<textarea required maxLength={500} rows={4} value={message} onChange={(event) => setMessage(event.target.value)} /></label>
          <label>Assinatura (opcional)<input maxLength={40} value={signature} onChange={(event) => setSignature(event.target.value)} /></label>
          {selfie && <label className="guestbook-consent">
            <input type="checkbox" checked={includePhoto} onChange={(event) => setIncludePhoto(event.target.checked)} />
            Quero incluir minha selfie e autorizo que ela apareça com o recado após aprovação.
          </label>}
          <fieldset>
            <legend>Stickers (opcional)</legend>
            <div className="guestbook-stickers">
              {stickers.map((name, i) => (
                <button key={name} type="button" aria-label={"Sticker " + (i + 1)} aria-pressed={selection.includes(name)}
                  disabled={selection.length >= 4 && !selection.includes(name)} onClick={() => toggleSticker(name)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stickerRoot + name} alt="" />
                </button>
              ))}
            </div>
          </fieldset>
          <Page entry={draft} />
          <button type="submit" disabled={!message.trim()}>enviar para aprovação</button>
        </form>
      )}
      {tab === "admin" && (
        <section aria-label="Moderação de teste">
          {entries.length === 0 && <p>Receba seu primeiro recado para testar a moderação.</p>}
          {entries.map((entry) => (
            <div className="guestbook-review" key={entry.id}>
              <Page entry={entry} />
              <p>{entry.approved ? "Aprovado" : "Pendente"}</p>
              {!entry.approved && <button type="button" onClick={() => save(entries.map((item) => item.id === entry.id ? { ...item, approved: true } : item))}>aprovar</button>}
              <button type="button" onClick={() => save(entries.filter((item) => item.id !== entry.id))}>{entry.approved ? "remover" : "recusar"}</button>
            </div>
          ))}
        </section>
      )}
    </SceneModal>
  );
}
