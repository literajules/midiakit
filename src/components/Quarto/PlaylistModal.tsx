"use client";

import { useState } from "react";
import SceneModal from "@/components/SceneModal/SceneModal";
import "./PlaylistModal.css";

/**
 * Playlist do Spotify aberta pelo toca-discos — embed oficial (iframe), como
 * a Jules pediu: mostra capa, play, lista de faixas, sem precisar de SDK.
 */
const PLAYLIST_ID = "3t0T3zLO6bYG47YbMLNna0";

export default function PlaylistModal({ onClosed }: { onClosed: () => void }) {
  // a playlist precisa carregar primeiro; as fitas washi (decorativas) só
  // aparecem depois que o iframe termina de carregar, senão elas "piscam"
  // na tela vazia antes do player do Spotify estar pronto.
  const [embedLoaded, setEmbedLoaded] = useState(false);

  return (
    <SceneModal onClosed={onClosed} dialogClassName="playlist-modal" aria-labelledby="playlist-modal-title">
      <h2 id="playlist-modal-title" className="sr-only">
        Playlist do quarto, no Spotify
      </h2>
      <iframe
        className="playlist-modal__embed"
        title="Playlist do Spotify"
        src={`https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`}
        width="100%"
        height="352"
        style={{ border: 0, borderRadius: 12 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        onLoad={() => setEmbedLoaded(true)}
      />
      {embedLoaded && (
        <>
          <span className="playlist-modal__tape playlist-modal__tape--left" aria-hidden="true" />
          <span className="playlist-modal__tape playlist-modal__tape--right" aria-hidden="true" />
        </>
      )}
    </SceneModal>
  );
}
