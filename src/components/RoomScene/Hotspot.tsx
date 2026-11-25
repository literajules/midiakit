
import { useLanguage } from "@/components/Language";
import type { CSSProperties } from "react";
import type { HotspotDef } from "./types";

type Props = {
  def: HotspotDef;
  /** número mostrado antes do nome, no tooltip, só no modo de teste */
  index: number;
  /** modo de teste: prefixa o tooltip com o número do hotspot */
  debug?: boolean;
  /** true no hotspot clicado por último — dispara o "ping" no pino */
  active?: boolean;
  /** recebe também o elemento clicado, pra quem precisar da posição exata
   * na tela (ex. zoom-a-partir-do-objeto nos modais) */
  onActivate: (def: HotspotDef, el: HTMLButtonElement) => void;
  /** avisa quando o mouse entra/sai do hotspot — pra animações de hover
   * desenhadas fora do próprio botão (ex. notas musicais do toca-discos) */
  onHover?: (id: string, hovering: boolean) => void;
};

/**
 * Ponto interativo sobre a foto de uma cena. Precisa ser filho de um
 * elemento com `position: relative` que tenha a proporção da imagem
 * original (o "quadro" — ver layout.ts): as coordenadas são porcentagens
 * desse quadro, então acompanham a foto em qualquer tamanho de tela. A área
 * clicável nunca fica menor que 44px (toque).
 *
 * Reaproveitado de literajules-site (CafeScene/Hotspot.tsx) — genérico,
 * serve pra qualquer RoomScene.
 *
 * É um <button>: foco por teclado e leitor de tela funcionam sem código extra.
 */
export default function Hotspot({ def, index, debug = false, active = false, onActivate, onHover }: Props) {
  const { t } = useLanguage();
  const english: Record<string, string> = {
  "Telefone": "Telephone",
  "Ficha de contato para marcas": "Brand inquiry form",
  "contato": "contact",
  "Toca-discos": "Record player",
  "Playlist do Spotify": "Spotify playlist",
  "Quadro de recados": "Corkboard",
  "Métricas de público": "Audience insights",
  "público": "audience",
  "Relógio de gato": "Cat clock",
  "Métricas e números": "Stats and numbers",
  "números": "stats",
  "Interruptor": "Light switch",
  "Acender/apagar a luz aconchegante": "Turn the light on or off",
  "luz": "light",
  "Porta": "Door",
  "Sair para o cozy corner": "Go to the Cozy Corner",
  "Livro": "Book",
  "Recibo — o que tá rolando por aqui": "Receipt — what’s happening around here",
  "Máquina de café": "Coffee machine",
  "Mapa de cafeterias favoritas": "Favorite cafés map",
  "Desktop interativo": "Interactive desktop",
  "Câmera DJI": "DJI camera",
  "Selfie redonda com a câmera": "Take a round selfie",
  "Caderno": "Notebook",
  "Livro de visitas": "Guestbook",
  "meu journal": "my journal"
};
  const labelFor = (label: string) => t(label, english[label] ?? label);
  const style: CSSProperties = {
    left: `${def.cx}%`,
    top: `${def.cy}%`,
    width: `max(${def.w}%, 44px)`,
    height: `max(${def.h}%, 44px)`,
  };

  const className = ["hotspot", active ? "is-active" : ""].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-label={`${labelFor(def.label)}: ${labelFor(def.destination)}`}
      onClick={(e) => onActivate(def, e.currentTarget)}
      onPointerEnter={() => onHover?.(def.id, true)}
      onPointerLeave={() => onHover?.(def.id, false)}
      onFocus={() => onHover?.(def.id, true)}
      onBlur={() => onHover?.(def.id, false)}
    >
      {/* área clicável (botão) continua do tamanho de `def.w`/`def.h` — só a
          MARCA visual encolheu pro "+" centralizado; o alvo de toque/clique
          real não muda, fica só invisível fora do pino e do tooltip. */}
      <span className="hotspot__pin" aria-hidden="true">
        <span className="hotspot__plus">
          <svg viewBox="0 0 12 12" width="7" height="7" aria-hidden="true">
            <path d="M6 1v10M1 6h10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
        <span className="hotspot__tooltip">
          {debug ? `${index + 1}. ${labelFor(def.label)}` : labelFor(def.teaser ?? def.label)}
        </span>
      </span>
    </button>
  );
}
