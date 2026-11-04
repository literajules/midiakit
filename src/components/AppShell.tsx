"use client";

import type { ReactNode } from "react";
import CrystalBallLoading from "./Loading/CrystalBallLoading";

/**
 * Casca do app: `CrystalBallLoading` sempre montada, por cima do resto do
 * site (`children`) — ela é um overlay de tela cheia (`position: fixed`)
 * que soma/some sozinha (sem precisar de nenhum scroll, automático ou
 * manual, pra "revelar" nada): o quarto já está montado e visível por
 * baixo desde o primeiro instante (ver `CrystalBallLoading.tsx` pras
 * fases de contagem → saída → desmontagem).
 *
 * Fica num componente próprio (em vez de direto em `page.tsx`, que é
 * Server Component por padrão) só por convenção de onde a casca do app
 * vive — hoje não precisa mais de estado próprio, mas mantém o lugar
 * certo pra crescer se precisar (ex. algo que dependa de montar depois do
 * primeiro paint).
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <CrystalBallLoading />
      {children}
    </>
  );
}
