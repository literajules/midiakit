"use client";

import "./BackArrow.css";

/**
 * Seta de volta pro quarto — fixa na borda esquerda da tela, sempre
 * visível. Diferente do `DoorInvite` do quarto (que só aparece no hover do
 * hotspot da porta), esta é um controle de navegação persistente, não um
 * hotspot da cena, então não depende de hover/foco pra aparecer.
 */
export default function BackArrow({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="back-arrow" onClick={onClick} aria-label="Voltar para o quarto">
      <svg className="back-arrow__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M15 5 L7 12 L15 19"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="back-arrow__label">quarto</span>
    </button>
  );
}
