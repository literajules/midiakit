"use client";

import "./QuickNav.css";

/**
 * Alvo de navegação do menu rápido — uma pasta do laptop (na cena
 * "cozy-corner" — "work" = Conteúdos, "projects" = Entregas, ver
 * DesktopPOV/folders.ts), uma das notas do quarto (relógio = números,
 * quadro de recados = público — ver Quarto.tsx) ou a ficha de contato
 * (telefone do quarto). Quem decide COMO chegar lá (trocar de cena ou
 * não, abrir o laptop ou abrir modal) é o `onNavigate` recebido de fora
 * (ver `goTo` em Site.tsx) — este componente só sabe os alvos, não a
 * mecânica de transição.
 *
 * O atalho de contato (reaproveitando o `FichaModal` do telefone) ficou
 * de fora do menu até a análise do site como mídia kit apontar que era
 * um buraco real: dava pra chegar em Números/Público/Conteúdos/Entregas
 * num clique, mas não no contato — exatamente a ação que fecha parceria.
 * Por isso ele tem destaque visual (`quick-nav__link--cta`), diferente
 * dos outros itens.
 */
export type NavTarget =
  | { scene: "cozy-corner"; openFolder: "work" | "projects" }
  | { scene: "quarto"; note: "mural" | "relogio" }
  | { scene: "quarto"; contact: true };

type Props = {
  onNavigate: (target: NavTarget) => void;
};

const NAV_ITEMS: Array<{ label: string; target: NavTarget; cta?: boolean }> = [
  { label: "Conteúdos", target: { scene: "cozy-corner", openFolder: "work" } },
  { label: "Entregas", target: { scene: "cozy-corner", openFolder: "projects" } },
  { label: "Números", target: { scene: "quarto", note: "relogio" } },
  { label: "Público", target: { scene: "quarto", note: "mural" } },
  { label: "Contato", target: { scene: "quarto", contact: true }, cta: true },
];

/**
 * Menu rápido fixo no topo do site — acesso de um clique às seções-chave
 * do mídia kit, de qualquer cena (quarto ou cozy corner), sem precisar
 * explorar a foto procurando o hotspot certo.
 *
 * Visual: um "chip" flutuante pequeno no canto superior direito (mesma
 * linguagem do `back-arrow`/`sound-toggle` — pílula clara com blur), não
 * uma barra de ponta a ponta, pra cobrir o mínimo possível da cena por
 * baixo. A lista rola na horizontal se não couber (celular). O item
 * "Contato" usa `quick-nav__link--cta` (fundo vinho) pra se destacar dos
 * demais, que são só texto.
 */
export default function QuickNav({ onNavigate }: Props) {
  return (
    <nav className="quick-nav" aria-label="Menu rápido">
      <ul className="quick-nav__list">
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              className={`quick-nav__link${item.cta ? " quick-nav__link--cta" : ""}`}
              onClick={() => onNavigate(item.target)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
