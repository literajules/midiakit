"use client";

import { visiblePosts } from "./linkedinPosts";
import "./LinkedInActivity.css";

/**
 * Mockup de LinkedIn, estilo "Activity" (ver referência visual na conversa:
 * cabeçalho com foto/nome/seguidores + pills de filtro + carrossel
 * horizontal de posts) — substitui o print estático de página inteira que
 * existia antes nessa aba: rolar 4000px de currículo dentro de uma janela
 * de navegador pequena era ruim de usar, e o que importa pra quem visita
 * (seguidor ou marca) são os posts, não o currículo linha a linha.
 *
 * Nome/cargo/seguidores vêm do print real que a Jules mandou
 * (`public/images/desktop/linkedin-profile.png`) — não são invenção, só
 * não estão "vivos" (precisam ser atualizados manualmente se mudarem no
 * LinkedIn de verdade). Os posts (`linkedinPosts.ts`) seguem o mesmo
 * padrão de PLACES/PROJECTS: vazios até a Jules mandar os reais, com
 * exemplos óbvios só em dev/preview.
 *
 * Pills de filtro: só "Posts" funciona (mostra o carrossel). As outras
 * (Comentários, Vídeos, Imagens, Artigos, Documentos) são só decoração —
 * fiéis ao LinkedIn real, mas sem experiência nenhuma por trás ainda.
 */

const FILTERS = ["Posts", "Comentários", "Vídeos", "Imagens", "Artigos", "Documentos"];

export default function LinkedInActivity() {
  return (
    <div className="linkedin-activity">
      <header className="linkedin-activity__header">
        <span className="linkedin-activity__avatar" aria-hidden="true">
          J
        </span>
        <div className="linkedin-activity__who">
          <p className="linkedin-activity__name">
            Julia Guyer
            <svg className="linkedin-activity__badge" viewBox="0 0 16 16" width="13" height="13" aria-label="Verificado">
              <path
                fill="#0a66c2"
                d="M8 0 9.8 1.6 12.2 1.2 12.8 3.6 15 4.8 14 7 15 9.2 12.8 10.4 12.2 12.8 9.8 12.4 8 14 6.2 12.4 3.8 12.8 3.2 10.4 1 9.2 2 7 1 4.8 3.2 3.6 3.8 1.2 6.2 1.6Z"
              />
              <path d="M5.6 8 7.2 9.6 10.6 6.2" fill="none" stroke="#fff" strokeWidth="0.6" />
            </svg>
          </p>
          <p className="linkedin-activity__headline">FBA Program Manager at Amazon</p>
          <p className="linkedin-activity__meta">Brazil · 1K seguidores</p>
        </div>
      </header>

      <nav className="linkedin-activity__pills" aria-label="Filtrar atividade">
        {FILTERS.map((f, i) => (
          <span key={f} className={`linkedin-activity__pill${i === 0 ? " is-active" : ""}`}>
            {f}
          </span>
        ))}
      </nav>

      {visiblePosts.length > 0 ? (
        <div className="linkedin-activity__feed" role="list" aria-label="Posts recentes">
          {visiblePosts.map((post) => (
            <article key={post.id} className="linkedin-activity__card" role="listitem">
              <div className="linkedin-activity__card-head">
                <span className="linkedin-activity__card-avatar" aria-hidden="true">
                  J
                </span>
                <div>
                  <p className="linkedin-activity__card-name">
                    Julia Guyer
                    <svg
                      className="linkedin-activity__badge linkedin-activity__badge--sm"
                      viewBox="0 0 16 16"
                      width="10"
                      height="10"
                      aria-hidden="true"
                    >
                      <path
                        fill="#0a66c2"
                        d="M8 0 9.8 1.6 12.2 1.2 12.8 3.6 15 4.8 14 7 15 9.2 12.8 10.4 12.2 12.8 9.8 12.4 8 14 6.2 12.4 3.8 12.8 3.2 10.4 1 9.2 2 7 1 4.8 3.2 3.6 3.8 1.2 6.2 1.6Z"
                      />
                    </svg>
                  </p>
                  <p className="linkedin-activity__card-meta">
                    {post.timeAgo ?? ""}
                    {post.demo && <span className="linkedin-activity__demo-tag">exemplo</span>}
                  </p>
                </div>
              </div>

              <p className="linkedin-activity__card-text">{post.text}</p>

              {post.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.imageUrl} alt={post.imageAlt ?? ""} className="linkedin-activity__card-img" />
              )}

              <p className="linkedin-activity__card-stats">
                {post.reactions ?? "0"} reações · {post.comments ?? "0"} comentários
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="linkedin-activity__empty">os posts da Jules entram aqui em breve ✨</p>
      )}
    </div>
  );
}
