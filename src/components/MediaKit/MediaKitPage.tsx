"use client";

import { MEDIA_KIT_DATA } from "@/lib/mediaKitData";
import "./MediaKitPage.css";

/**
 * Mídia kit "de bolso" — uma página, visual de papelaria com os elementos
 * reais que a Jules separou. Curadoria (2ª versão — a 1ª tinha o fundo do
 * caderno com transparência real que "vazava" nas bordas, espaço vazio
 * demais embaixo, photobooth minúsculo e dois ícones de pasta cortando na
 * borda da folha):
 *  - fundo: papel rosa com moldura ornamental já desenhada nele mesmo
 *    (`pink-paper.jpg`) — substitui o caderno (que tinha transparência de
 *    verdade e não cobria a folha por completo).
 *  - só 4 elementos soltos agora (washi + photobooth, estrela, pasta,
 *    clipe) — tirei o prendedor do topo: a própria moldura do papel já dá
 *    acabamento, o prendedor só competia com ela.
 *  - nichos e formatos viraram UMA seção (duas colunas), não duas
 *    "pastinhas" separadas — resolve o corte na borda e dá mais
 *    consistência com as outras seções.
 *  - os 3 títulos de seção (números / público / nichos & formatos) agora
 *    usam o MESMO estilo (antes "nichos"/"formatos" tinham um estilo
 *    diferente dos outros dois).
 *  - a folha não tem mais altura fixa de A4 na tela (só na impressão, ver
 *    CSS) — o tamanho agora é o do conteúdo de verdade, sem a sobra de
 *    espaço vazio de antes.
 *
 * "Baixar" = o botão abaixo chama `window.print()`; a pessoa escolhe
 * "Salvar como PDF" no diálogo do próprio navegador.
 */
export default function MediaKitPage() {
  const d = MEDIA_KIT_DATA;

  return (
    <div className="media-kit-page">
      <div className="media-kit-page__toolbar">
        <button type="button" className="media-kit-page__print-btn" onClick={() => window.print()}>
          baixar em PDF
        </button>
        <p className="media-kit-page__hint">
          abre o diálogo de impressão do navegador — escolha <strong>&ldquo;Salvar como PDF&rdquo;</strong> como
          destino.
        </p>
      </div>

      <main className="media-kit-page__sheet" aria-label="Mídia kit de bolso">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/media-kit/pink-paper.jpg" alt="" aria-hidden="true" className="media-kit-page__bg" />

        <div className="media-kit-page__content">
          <header className="media-kit-page__header">
            <div className="media-kit-page__photobooth-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/media-kit/photobooth.png" alt="" className="media-kit-page__photobooth" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/media-kit/washi.png" alt="" aria-hidden="true" className="media-kit-page__washi" />
            </div>
            <div className="media-kit-page__header-text">
              <p className="media-kit-page__kicker">mídia kit · versão de bolso</p>
              <h1 className="media-kit-page__title">literajules</h1>
              <p className="media-kit-page__handle">{d.handle}</p>
              <p className="media-kit-page__tagline">&ldquo;{d.tagline}&rdquo;</p>
              <p className="media-kit-page__bioline">{d.bio}</p>
            </div>
          </header>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/media-kit/lace.png" alt="" aria-hidden="true" className="media-kit-page__lace" />

          <section className="media-kit-page__section">
            <div className="media-kit-page__section-title">
              <h2>números de agora</h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/media-kit/star.png" alt="" aria-hidden="true" className="media-kit-page__star" />
            </div>
            <div className="media-kit-page__grid">
              {d.stats.map((s) => (
                <div key={s.label} className="media-kit-page__card">
                  <p className="media-kit-page__value">{s.value}</p>
                  <p className="media-kit-page__label">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="media-kit-page__section">
            <div className="media-kit-page__section-title">
              <h2>quem tá por aqui</h2>
            </div>
            <div className="media-kit-page__grid">
              {d.audience.map((a) => (
                <div key={a.label} className="media-kit-page__card">
                  <p className="media-kit-page__value">{a.value}</p>
                  <p className="media-kit-page__label">{a.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="media-kit-page__section media-kit-page__section--last">
            <div className="media-kit-page__section-title">
              <h2>nichos &amp; formatos</h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/media-kit/folder.png" alt="" aria-hidden="true" className="media-kit-page__folder-icon" />
            </div>
            <div className="media-kit-page__two-col">
              <div className="media-kit-page__col">
                <p className="media-kit-page__col-label">nichos</p>
                <div className="media-kit-page__chips">
                  {d.niches.map((n) => (
                    <span key={n} className="media-kit-page__chip">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="media-kit-page__col">
                <p className="media-kit-page__col-label">formatos</p>
                <div className="media-kit-page__chips">
                  {d.formats.map((f) => (
                    <span key={f} className="media-kit-page__chip">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <footer className="media-kit-page__footer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/media-kit/clip.png" alt="" aria-hidden="true" className="media-kit-page__clip" />
            <p className="media-kit-page__footer-sign">vamos criar algo juntas? ♡</p>
            <p className="media-kit-page__footer-contact">{d.email}</p>
            <p className="media-kit-page__footer-link">{d.link}</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
