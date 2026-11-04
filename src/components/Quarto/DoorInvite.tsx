"use client";

import { useEffect, useState } from "react";
import { useNoHover, usePrefersReducedMotion } from "@/lib/motion";
import "./DoorInvite.css";

const MESSAGE = "vamos tomar um café?";
const TYPE_MS = 38; // por caractere

/**
 * Convite visual da porta — seta fina + "vamos tomar um café?", digitada
 * letra por letra conforme aparece (fonte Homemade Apple).
 *
 * Fica visível quando `visible` é true (hover OU foco por teclado no
 * hotspot da porta — essa prop já chega calculada do Quarto.tsx). Em
 * dispositivos sem hover (touch), o CSS (`@media (hover: none)`) mostra uma
 * versão sempre visível, bem discreta, como alternativa de acesso — ver
 * DoorInvite.css.
 *
 * Posicionado no vão de parede entre a planta e a porta (não cobre o mural
 * nem a planta). `aria-hidden`: é só reforço visual: o hotspot da porta
 * (RoomScene/Hotspot.tsx) já tem `aria-label` com a descrição real.
 */
export default function DoorInvite({
  visible,
  night = false,
  frozen = false,
}: {
  visible: boolean;
  night?: boolean;
  /** `true` com algum pop-up do quarto aberto — pausa o cursor piscando
   * (ver Quarto.tsx `anyModalOpen`), pro fundo ficar completamente fixo. */
  frozen?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const [typed, setTyped] = useState(0);
  // touch (sem hover): a dica já fica sempre visível por CSS — o texto
  // também precisa estar completo desde o início, sem esperar um "hover"
  // que nunca vai acontecer nesses dispositivos.
  const noHover = useNoHover();

  useEffect(() => {
    if (noHover) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com capacidade de hover do dispositivo, não com props/estado do próprio componente
      setTyped(MESSAGE.length);
      return;
    }
    if (!visible) {
      setTyped(0);
      return;
    }
    if (reduced) {
      setTyped(MESSAGE.length);
      return;
    }
    const id = window.setInterval(() => {
      setTyped((n) => {
        if (n >= MESSAGE.length) {
          window.clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, TYPE_MS);
    return () => window.clearInterval(id);
  }, [visible, reduced, noHover]);

  return (
    <div
      className={`door-invite${visible ? " is-visible" : ""}${night ? " door-invite--night" : ""}${frozen ? " door-invite--frozen" : ""}`}
      aria-hidden="true"
    >
      <p className="door-invite__line">
        {MESSAGE.slice(0, typed)}
        <span className="door-invite__caret" />
      </p>
      <svg className="door-invite__arrow" viewBox="0 0 90 70" width="72" height="56" aria-hidden="true">
        <path
          d="M6 8 C 40 4, 66 20, 78 52"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M68 46 L79 53 L70 58"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
