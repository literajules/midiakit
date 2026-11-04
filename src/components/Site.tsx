"use client";

import { useEffect, useState } from "react";
import CozyCorner from "@/components/CozyCorner/CozyCorner";
import Quarto from "@/components/Quarto/Quarto";
import QuickNav, { type NavTarget } from "@/components/QuickNav/QuickNav";

type Scene = "quarto" | "cozy-corner";

/**
 * Casca das cenas do mídia kit. Por clique (não por scroll): o quarto é a
 * cena inicial. Clicar na porta (quarto → cozy corner) ou na `BackArrow`
 * (cozy corner → quarto) troca a cena DIRETO, sem véu/tela de transição no
 * meio (removido — ver conversa "remover a tela de carregamento entre o
 * quarto e o cozy corner"; o antigo `DoorTransition` cobria a tela com uma
 * mensagem enquanto trocava por baixo).
 *
 * Cada cena ocupa só a própria tela (sem scroll-section extra depois do
 * cozy corner — o antigo "capítulo 3"/scrollytelling foi removido), então
 * a troca por clique continua sendo a única forma de ir de uma cena pra
 * outra. `switchScene` é o único lugar que troca a cena de verdade: muda o
 * estado e rola pro topo do `#top` (a `<main>` em page.tsx), pra cena nova
 * (quarto OU cozy corner) sempre começar do topo.
 *
 * `CrystalBallLoading` (em `AppShell.tsx`) é um overlay de tela cheia por
 * cima de tudo isso, não uma seção no fluxo da página — ela mesma some
 * sozinha (sem depender de scroll, automático ou manual) quando o
 * carregamento termina. Por isso o quarto não precisa mais de nenhum
 * `revealOnScroll`/fade ligado à posição de rolagem: nasce sempre
 * assentado/opaco, igual ao cozy corner.
 *
 * `QuickNav` (menu fixo no topo) reaproveita essa MESMA `switchScene` pra
 * levar o visitante direto a uma nota, pasta do laptop ou a ficha de
 * contato, de qualquer cena: `goTo` decide se precisa trocar de cena
 * (`queuedTarget` guarda o alvo até a cena certa estar em pé) ou se já
 * está na cena certa (aplica direto). `applyTarget` é o "fazer" de
 * verdade — abrir uma pasta do laptop (conteúdos/entregas — ver
 * CozyCorner.tsx `openFolder`), uma nota do quarto (números = relógio,
 * público = mural — ver Quarto.tsx `openNote`) ou a ficha (telefone —
 * ver Quarto.tsx `openContact`).
 */
export default function Site() {
  const [scene, setScene] = useState<Scene>("quarto");
  const [queuedTarget, setQueuedTarget] = useState<NavTarget | null>(null);
  const [openNote, setOpenNote] = useState<"mural" | "relogio" | null>(null);
  const [openFolder, setOpenFolder] = useState<"work" | "projects" | null>(null);
  const [openContact, setOpenContact] = useState(false);

  // única porta de troca de cena — porta, seta de voltar e QuickNav (cross-
  // cena) todos passam por aqui. Sem véu/tela de transição no meio: a cena
  // nova substitui a antiga direto, só já rolada pro próprio topo.
  const switchScene = (next: Scene) => {
    setScene(next);
    requestAnimationFrame(() => {
      document.getElementById("top")?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  };

  const applyTarget = (target: NavTarget) => {
    if (target.scene === "cozy-corner") {
      setOpenFolder(target.openFolder);
      return;
    }
    if ("contact" in target) {
      setOpenContact(true);
      return;
    }
    setOpenNote(target.note);
  };

  const goTo = (target: NavTarget) => {
    if (scene === target.scene) {
      // já está na cena certa: só espera um frame (layout assentar) e aplica
      requestAnimationFrame(() => applyTarget(target));
      return;
    }
    setQueuedTarget(target);
    switchScene(target.scene);
  };

  // assim que a cena muda pra bater com o alvo enfileirado, aplica. O
  // `setQueuedTarget(null)` fica dentro do callback do rAF (não direto no
  // corpo do efeito) — limpa e aplica no mesmo quadro, em vez de dois
  // setState síncronos seguidos no corpo do efeito.
  useEffect(() => {
    if (!queuedTarget || queuedTarget.scene !== scene) return;
    const target = queuedTarget;
    const raf = requestAnimationFrame(() => {
      setQueuedTarget(null);
      applyTarget(target);
    });
    return () => cancelAnimationFrame(raf);
    // "queuedTarget" é consumido manualmente acima — só reage à troca de cena
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return (
    <>
      <QuickNav onNavigate={goTo} />

      {scene === "quarto" && (
        <Quarto
          onDoorClick={() => switchScene("cozy-corner")}
          openNote={openNote}
          onOpenNoteHandled={() => setOpenNote(null)}
          openContact={openContact}
          onOpenContactHandled={() => setOpenContact(false)}
        />
      )}
      {scene === "cozy-corner" && (
        <CozyCorner
          onBackClick={() => switchScene("quarto")}
          openFolder={openFolder}
          onOpenFolderHandled={() => setOpenFolder(null)}
        />
      )}
    </>
  );
}
