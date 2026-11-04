"use client";

import { toggleMuted, useMuted } from "@/lib/sound";
import "./SoundToggle.css";

/**
 * Botão fixo num canto da tela (igual ao `back-arrow`, mesma ideia de
 * controle "fora" da cena) pra silenciar/reativar todos os efeitos
 * sonoros do site de uma vez. Estado persistido em `localStorage` — ver
 * `lib/sound.ts`.
 */
export default function SoundToggle() {
  const muted = useMuted();

  return (
    <button
      type="button"
      className={`sound-toggle${muted ? " is-muted" : ""}`}
      onClick={() => toggleMuted()}
      aria-pressed={muted}
      aria-label={muted ? "Ativar sons do site" : "Silenciar sons do site"}
      title={muted ? "Ativar sons" : "Silenciar sons"}
    >
      {muted ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M4 9v6h4l5 5V4L8 9H4Z"
            fill="currentColor"
          />
          <path
            d="M16 9l5 6M21 9l-5 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M4 9v6h4l5 5V4L8 9H4Z"
            fill="currentColor"
          />
          <path
            d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
