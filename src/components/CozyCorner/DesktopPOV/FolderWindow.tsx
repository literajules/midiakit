"use client";

import { useRef, useState } from "react";
import DesktopWindow from "./DesktopWindow";
import { visibleContentFormats } from "./contentFormats";
import { DESKTOP_FOLDERS, type DesktopFolderId } from "./folders";
import { visibleProjects, type ProjectCase } from "./projects";
import "./FolderWindow.css";

type Props = {
  folderId: DesktopFolderId;
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
  initialOffset?: { x: number; y: number };
  /** item já selecionado ao montar — vindo do ícone de marca no desktop
   * (ver DesktopPOV.tsx `handleBrandClick`), em vez de esperar o clique
   * na grade aqui dentro. Só lido na montagem (inicializador do useState
   * abaixo); pra focar OUTRO item depois, o pai remonta com uma `key`
   * diferente (ver DesktopPOV.tsx). */
  initialSelectedId?: string | null;
};

const CASE_COLORS = ["#8a7a63", "#6f7d6b", "#7a6a86", "#8a5f5f"];

/** nome mostrado no grid/ícone — marca (Entregas) ou título do formato (Conteúdos) */
const displayName = (c: ProjectCase) => c.title ?? c.brand ?? "?";

/**
 * Janela estilo Finder — grade de itens (ícone + nome embaixo, igual uma
 * pasta de verdade) com um painel de detalhe ao clicar (volta pra grade
 * com o botão "‹ [nome da pasta]", sem abrir uma SEGUNDA janela por cima).
 * "Entregas" (cases de marca, `projects.ts`) e "Conteúdos" (formatos que a
 * Jules trabalha, `contentFormats.ts`) têm esse mecanismo de conteúdo —
 * mesmo tipo `ProjectCase` nos dois; as outras pastas mostram um estado
 * vazio honesto — nenhum currículo/moodboard/formato inventado.
 *
 * O detalhe de um item tem um toque "site pessoal dos anos 2000": moldura
 * pontilhada, fundo de bolinhas quase imperceptível, fita washi real nos
 * cantos da capa do vídeo (`/images/desktop/decor/washi-tape.jpg`, com
 * `mix-blend-mode: multiply` pra sumir o fundo branco do jpg), divisor ✦,
 * e selos de formato/categoria com relevo tipo botão Web 1.0 — pedido
 * explícito, ver conversa "projects folder". Em janelas largas o vídeo
 * fica numa coluna à esquerda e o resto (título/badges/texto/insights) à
 * direita — `@container` reage à largura da PRÓPRIA janela, não da tela,
 * então funciona igual em qualquer tamanho de viewport. Setas "‹ › "
 * passeiam entre os itens sem voltar pra grade a cada clique.
 *
 * Os badges de marca/formato/categoria e as imagens/stats de insights só
 * aparecem quando o dado existir em `projects.ts`/`contentFormats.ts`
 * (nada inventado).
 */
export default function FolderWindow({ folderId, onClose, onFocus, zIndex, initialOffset, initialSelectedId }: Props) {
  const def = DESKTOP_FOLDERS.find((f) => f.id === folderId);

  const items =
    folderId === "projects" ? visibleProjects : folderId === "work" ? visibleContentFormats : [];

  const [selected, setSelected] = useState<ProjectCase | null>(
    () => (initialSelectedId ? items.find((it) => it.id === initialSelectedId) ?? null : null)
  );
  const detailRef = useRef<HTMLDivElement>(null);

  const selectedIndex = selected ? items.findIndex((it) => it.id === selected.id) : -1;

  /** abre um item (grade OU setas) e garante que a página começa do topo —
   * sem isso, trocar de item pelas setas manteria a rolagem do item anterior. */
  const selectItem = (item: ProjectCase) => {
    setSelected(item);
    requestAnimationFrame(() => detailRef.current?.scrollTo({ top: 0 }));
  };

  const goToOffset = (offset: 1 | -1) => {
    if (selectedIndex < 0 || items.length < 2) return;
    selectItem(items[(selectedIndex + offset + items.length) % items.length]);
  };

  return (
    <DesktopWindow
      className="folder-window"
      title={def?.label ?? "Pasta"}
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
      initialOffset={initialOffset}
    >
      {selected ? (
        <div className="folder-window__detail-wrap">
          <article ref={detailRef} className="folder-window__detail">
            <button type="button" className="folder-window__back" onClick={() => setSelected(null)}>
              ‹ {def?.label}
            </button>

            <div className="folder-window__detail-grid">
              <div className="folder-window__detail-media">
                {/* fita washi real, dois pedaços — mesmo truque de Polaroid colada na página */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/desktop/decor/washi-tape.jpg" alt="" aria-hidden="true" className="folder-window__tape folder-window__tape--left" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/desktop/decor/washi-tape.jpg" alt="" aria-hidden="true" className="folder-window__tape folder-window__tape--right" />

                <div
                  className="folder-window__cover"
                  style={
                    selected.videoUrl && selected.videoAspect
                      ? { aspectRatio: `${selected.videoAspect.w} / ${selected.videoAspect.h}` }
                      : undefined
                  }
                >
                  {selected.videoUrl ? (
                    <video
                      key={selected.videoUrl}
                      src={selected.videoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="folder-window__cover-video"
                    />
                  ) : selected.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selected.imageUrl} alt="" className="folder-window__cover-img" />
                  ) : (
                    <span className="folder-window__cover-fallback">{displayName(selected).trim().charAt(0).toUpperCase() || "?"}</span>
                  )}
                </div>
              </div>

              <div className="folder-window__detail-info">
                <h3 className="folder-window__title">
                  {displayName(selected)}
                  {selected.demo && <span className="folder-window__demo-tag">exemplo</span>}
                </h3>

                <div className="folder-window__badges" aria-label="Detalhes">
                  {selected.brand && <span className="folder-window__badge folder-window__badge--brand">{selected.brand}</span>}
                  {selected.format && <span className="folder-window__badge folder-window__badge--seal folder-window__badge--format">{selected.format}</span>}
                  {selected.category && (
                    <span className="folder-window__badge folder-window__badge--seal folder-window__badge--category">{selected.category}</span>
                  )}
                </div>

                {selected.role && <p className="folder-window__eyebrow">{selected.role}</p>}
                <p className="folder-window__desc">{selected.description}</p>

                {selected.visitUrl && (
                  <a className="folder-window__visit" href={selected.visitUrl} target="_blank" rel="noopener noreferrer">
                    {selected.visitLabel ?? "Ver mais"} ↗
                  </a>
                )}
              </div>
            </div>

            {((selected.insightImages && selected.insightImages.length > 0) ||
              (selected.insightStats && selected.insightStats.length > 0)) && (
              <>
                <p className="folder-window__divider" aria-hidden="true">
                  ✦ ✦ ✦
                </p>
                <h4 className="folder-window__insights-title">insights &amp; comentários</h4>

                {selected.insightImages && selected.insightImages.length > 0 && (
                  <div className="folder-window__insights">
                    {selected.insightImages.map((img) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={img.src} src={img.src} alt={img.alt} className="folder-window__insight-img" loading="lazy" />
                    ))}
                  </div>
                )}

                {selected.insightStats && selected.insightStats.length > 0 && (
                  <div className="folder-window__stats" aria-label="Números da publi">
                    {selected.insightStats.map((s) => (
                      <span key={s.label} className="folder-window__stat">
                        <strong>{s.value}</strong> {s.label}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </article>

          {items.length > 1 && (
            <>
              <button type="button" className="folder-window__nav folder-window__nav--prev" onClick={() => goToOffset(-1)} aria-label="Item anterior">
                ‹
              </button>
              <button type="button" className="folder-window__nav folder-window__nav--next" onClick={() => goToOffset(1)} aria-label="Próximo item">
                ›
              </button>
            </>
          )}
        </div>
      ) : items.length > 0 ? (
        <div className="folder-window__grid">
          {items.map((project, i) => (
            <button key={project.id} type="button" className="folder-window__item" onClick={() => selectItem(project)}>
              {project.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.imageUrl} alt="" className="folder-window__item-logo" />
              ) : (
                <span className="folder-window__item-icon" style={{ background: CASE_COLORS[i % CASE_COLORS.length] }}>
                  {displayName(project).trim().charAt(0).toUpperCase() || "?"}
                </span>
              )}
              <span className="folder-window__item-label">{displayName(project)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="folder-window__empty">
          <svg viewBox="0 0 48 40" width="44" height="37" aria-hidden="true" className="folder-window__empty-icon">
            <path
              d="M3 11a3 3 0 0 1 3-3h10l4 5h22a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
          <p>{def?.emptyHint}</p>
        </div>
      )}
    </DesktopWindow>
  );
}
