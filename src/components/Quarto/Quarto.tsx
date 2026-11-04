"use client";

import { useEffect, useState } from "react";
import RoomScene from "@/components/RoomScene/RoomScene";
import type { HotspotDef } from "@/components/RoomScene/types";
import { playPhoneRing, playSound } from "@/lib/sound";
import BookReceiptModal from "./BookReceiptModal";
import DoorInvite from "./DoorInvite";
import FichaModal from "./FichaModal";
import NoteModal from "./NoteModal";
import PlaylistModal from "./PlaylistModal";
import { QUARTO_HOTSPOTS } from "./hotspots";
import "./Quarto.css";

type OriginPoint = { x: number; y: number };

function centerOf(el: HTMLElement): OriginPoint {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Ponto focal do recorte "cover" do quarto (ver RoomScene/layout.ts).
 *
 * `bg-01-dia-fechada.png` é 1536×659 (2,33:1) — mais larga que qualquer
 * tela comum, então cobrir SEMPRE recorta dos lados; a pergunta é só qual
 * lado sacrificar. Ajuste feito a pedido (cama mais centralizada, telefone
 * mais visível, mural pode perder um pouco — ver conversa "ajustes no
 * enquadramento do quarto"): `focalX` baixou de 0,90 pra **0,60**, puxando
 * o recorte pra perto do centro da cama em vez de ancorado na porta/mural.
 *
 * Resultado por tela (fração de largura visível entre parênteses):
 *  - Desktop 1920×1080 / 1366×768 (76%): cama bem centralizada; telefone
 *    ~39% visível (bem melhor que 0% antes); porta inteira; mural ~31%.
 *  - Notebook 1440×900 (69% — a faixa mais apertada que ainda usa "cover"):
 *    cama centralizada, porta inteira; telefone e mural quase não aparecem
 *    aqui especificamente (a janela de 69% não é larga o suficiente pra
 *    incluir telefone + mural ao mesmo tempo que cama + porta inteiras —
 *    nessa faixa, mural cede o lugar).
 *  - Celular na horizontal (93%): quase tudo visível — telefone e porta
 *    inteiros, mural ~81%.
 *
 * `panTrigger` subiu de 0,5 pra **0,6**: tablet em paisagem (1024×768, 57%
 * de largura visível) não cabia mais com esse focal point sem cortar a
 * própria porta — em vez disso, passa pro modo "pan" (sem recorte, rolagem
 * horizontal) junto com tablet/celular em pé, preservando porta+mural+cama
 * inteiros ali, só a um gesto de distância.
 */
const QUARTO_LAYOUT = { focalX: 0.6, panTrigger: 0.6 };

/**
 * Cena 1 — o quarto. Primeira seção interativa do mídia kit.
 *
 * Objetos ligados: telefone (ficha), toca-discos (playlist), quadro de
 * recados (métricas de público), relógio (métricas/números), interruptor
 * (troca de iluminação), porta (gatilho pro cozy corner), livro (recibo).
 *
 * Luz (interruptor) e porta (hover) agora usam as 4 fotos reais que a
 * Jules gerou (dia/noite × fechada/entreaberta) em crossfade, em vez de
 * aproximação por CSS — ver bg-0X-*.png.
 *
 * Som: clique do interruptor (`handleActivate`) e o telefone "tocando"
 * assim que o mouse encosta nele (`handleHover`, via `onHotspotHover`) —
 * ver `lib/sound.ts`. Mudo globalmente, controlado pelo `SoundToggle` no
 * canto da tela (fora desta cena, vive no layout).
 *
 * `onDoorClick`: só avisa o pai (Site.tsx) que a porta foi clicada — quem
 * decide o que acontece depois (véu de transição + troca pra cena do cozy
 * corner) é o pai, não esta cena.
 *
 * `openNote`/`onOpenNoteHandled`: abertura EXTERNA do mural ou do relógio,
 * pelo menu rápido (`QuickNav`/`Site.tsx` — "números"/"público"), sem
 * precisar clicar no hotspot na foto. Como não veio de um clique, não há
 * elemento de origem pra zoom-a-partir-do-objeto — abre centralizada
 * (`origin: null`, ver `SceneModal`). `onOpenNoteHandled` avisa o pai que
 * já abriu, pra ele limpar o pedido (senão reabriria a cada re-render).
 */
export default function Quarto({
  onDoorClick,
  openNote,
  onOpenNoteHandled,
  openContact,
  onOpenContactHandled,
  revealOnScroll = false,
}: {
  onDoorClick: () => void;
  openNote?: "mural" | "relogio" | null;
  onOpenNoteHandled?: () => void;
  /** abertura EXTERNA da ficha de contato (telefone), pelo atalho
   * "Contato" do QuickNav — mesmo padrão de `openNote` acima. */
  openContact?: boolean;
  onOpenContactHandled?: () => void;
  /** `true` só na primeira vez que o quarto aparece (ver doc em Site.tsx). */
  revealOnScroll?: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // padrão: luz acesa (quarto abre de dia/iluminado) — a pessoa apaga no
  // interruptor se quiser.
  const [roomDark, setRoomDark] = useState(false);
  const doorHover = hoveredId === "porta";
  const swaySuffix = roomDark ? "noite" : "dia";

  const [contactOpen, setContactOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [note, setNote] = useState<"mural" | "relogio" | null>(null);
  const [origin, setOrigin] = useState<OriginPoint | null>(null);
  // com QUALQUER pop-up aberto, o fundo (foto do quarto) fica TOTALMENTE
  // fixo — não só sem pular de posição (isso já é garantido por
  // `scrollbar-gutter: stable` em globals.css), mas também sem nenhuma
  // animação ambiente rodando por baixo do véu (ver `.quarto-decor` em
  // Quarto.css): a planta/relógio balançando, o brilho do disco girando,
  // as notas musicais, o brilho do mural e o cursor do convite da porta
  // todos pausam enquanto um modal estiver em cima.
  const anyModalOpen = contactOpen || playlistOpen || bookOpen || note !== null;

  // abertura externa (menu rápido) — ver doc da prop acima. Os setState
  // ficam dentro do callback do rAF (não direto no corpo do efeito): evita
  // os 3 setState síncronos em sequência no corpo do efeito.
  useEffect(() => {
    if (!openNote) return;
    const raf = requestAnimationFrame(() => {
      setOrigin(null);
      setNote(openNote);
      onOpenNoteHandled?.();
    });
    return () => cancelAnimationFrame(raf);
  }, [openNote, onOpenNoteHandled]);

  // idem, pra ficha de contato (atalho "Contato" do QuickNav)
  useEffect(() => {
    if (!openContact) return;
    const raf = requestAnimationFrame(() => {
      setContactOpen(true);
      onOpenContactHandled?.();
    });
    return () => cancelAnimationFrame(raf);
  }, [openContact, onOpenContactHandled]);

  const handleActivate = (def: HotspotDef, el: HTMLButtonElement) => {
    setActiveId(def.id);

    switch (def.id) {
      case "telefone":
        setContactOpen(true);
        return;
      case "toca-discos":
        setPlaylistOpen(true);
        return;
      case "livro":
        setBookOpen(true);
        return;
      case "mural":
        setOrigin(centerOf(el));
        setNote("mural");
        return;
      case "relogio":
        setOrigin(centerOf(el));
        setNote("relogio");
        return;
      case "interruptor":
        playSound("switch");
        setRoomDark((v) => !v);
        return;
      case "porta":
        onDoorClick();
        return;
      default:
        window.setTimeout(() => setActiveId((cur) => (cur === def.id ? null : cur)), 1200);
    }
  };

  const handleHover = (id: string, hovering: boolean) => {
    setHoveredId(hovering ? id : null);
    // "encostar" no telefone e ele tocar — só no instante em que o mouse
    // entra (hovering vira true), não repete enquanto fica parado em cima.
    // Toque curto (~0,3s, ver playPhoneRing).
    if (id === "telefone" && hovering) playPhoneRing();
  };

  return (
    <>
      <RoomScene
        id="quarto"
        ariaLabel="O quarto"
        sceneW={1536}
        sceneH={659}
        imageSrc="/images/quarto/bg-01-dia-fechada.png"
        imageAlt="Quarto cozy da Jules: cama de bolinhas, cômoda com toca-discos e telefone vintage, relógio de gato, quadro de recados, luminária de papel e porta branca."
        hotspots={QUARTO_HOTSPOTS}
        onActivate={handleActivate}
        activeId={activeId}
        onHotspotHover={handleHover}
        background="var(--cream)"
        revealOnScroll={revealOnScroll}
        layoutOptions={QUARTO_LAYOUT}
      >
        {/* ——— as outras 3 fotos (dia+entreaberta, noite+fechada, noite+entreaberta)
            empilhadas por cima da base (dia+fechada), cada uma some/aparece
            por opacidade conforme o estado — crossfade entre fotos reais,
            sem CSS tentando fingir luz ou porta abrindo. ——— */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/quarto/bg-02-dia-aberta.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="quarto-bg-layer"
          style={{ opacity: !roomDark && doorHover ? 1 : 0 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/quarto/bg-03-noite-fechada.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="quarto-bg-layer"
          style={{ opacity: roomDark && !doorHover ? 1 : 0 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/quarto/bg-04-noite-aberta.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="quarto-bg-layer"
          style={{ opacity: roomDark && doorHover ? 1 : 0 }}
        />

        {/* ——— tratamento de imagem: brilho das luminárias acesas +
            vinheta leve (sombreamento). O grain já existe globalmente
            (globals.css `--grain`), por isso não repete aqui. Ficam FORA
            do `.quarto-decor` abaixo de propósito: não têm animação
            contínua (só opacidade ligada ao estado da luz), então não
            precisam pausar com um pop-up aberto. ——— */}
        <div
          className={`quarto-light-glow quarto-light-glow--lustre${roomDark ? " is-night" : ""}`}
          aria-hidden="true"
          style={{ left: "49.3%", top: "10.7%" }}
        />
        <div className="quarto-light-glow quarto-light-glow--abajur" aria-hidden="true" style={{ left: "27%", top: "45%" }} />
        <div className="quarto-vignette" aria-hidden="true" />

        {/* ——— tudo com animação CONTÍNUA (sem depender de um evento único)
            mora aqui dentro: a planta/rabo do relógio balançando, o brilho
            do disco girando, as notas musicais e o cursor do convite da
            porta. Com qualquer pop-up aberto (`anyModalOpen`), tudo isso
            pausa (`.is-frozen`, ver Quarto.css) — o fundo fica
            COMPLETAMENTE fixo atrás do véu, não só sem pular de posição. */}
        <div className={`quarto-decor${anyModalOpen ? " is-frozen" : ""}`}>
          {/* camadas de balanço ambiente — cada uma é um recorte da própria
              foto, posicionado exatamente por cima do original; a pequena
              rotação revela só a borda emplumada (margem com alpha
              esmaecido), por isso não aparece "costura". A planta da
              janela parou de balançar (só a do vaso e o rabo do relógio);
              troca pra versão "noite" junto com a luz. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`planta-porta-${swaySuffix}`}
            src={`/images/quarto/sway-planta-porta-${swaySuffix}.png`}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="quarto-sway quarto-sway--planta-porta"
            style={{ left: "61.65%", top: "44.6%", width: "9.64%", height: "27.9%" }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`relogio-rabo-${swaySuffix}`}
            src={`/images/quarto/sway-relogio-rabo-${swaySuffix}.png`}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="quarto-sway quarto-sway--relogio-rabo"
            style={{ left: "30.08%", top: "21.24%", width: "5.4%", height: "11.84%" }}
          />

          {/* telefone: tentativa de hover (fone tremendo) removida — o recorte
              deixava pedaço do fundo visível ao mover. Fica só com o hotspot
              normal por enquanto. */}

          {/* ——— mural: brilho abstrato só no hover, sem duplicar a foto ———
              Tentativa anterior sobrepunha uma cópia dos papéis
              (`sway-mural-papers-*.png`) por cima da foto pra simular
              "levantar" — mas esse recorte não é um crop pixel-a-pixel do
              original (é uma geração separada), então qualquer posição
              mostrava as duas camadas ligeiramente desalinhadas: texto e
              fotos duplicados, embaralhados. Esta versão não duplica nada —
              só um brilho quente e abstrato por cima da área do mural, sem
              nenhum conteúdo da foto por baixo pra desalinhar. */}
          <div
            className={`quarto-mural-glow${hoveredId === "mural" ? " is-on" : ""}`}
            aria-hidden="true"
            style={{ left: "85.6%", top: "5.85%", width: "14.8%", height: "36.5%" }}
          />

          {/* ——— toca-discos: disco + braço isolados do fundo ———
              o disco, fotografado em ângulo, é uma ELIPSE achatada, não um
              círculo — por isso ele nunca gira de verdade (giraria "cambaleando",
              já que rotacionar a imagem rotacionaria a elipse inteira). Em vez
              disso, o disco fica fixo (sem nenhuma transformação, encaixe
              perfeito com a foto de base) e um brilho gira POR DENTRO do
              recorte elíptico (clip fixo), simulando o reflexo de um disco de
              verdade girando. O braço/agulha tem uma rotação pequena e
              mecânica, de verdade. */}
          <div className="quarto-disc" style={{ left: "21.94%", top: "48.71%", width: "3.52%", height: "3.03%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/quarto/sway-disco-${swaySuffix}.png`} alt="" aria-hidden="true" draggable={false} />
            <span className={`quarto-disc-shine${hoveredId === "toca-discos" ? " is-on" : ""}`} aria-hidden="true" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`braco-${swaySuffix}`}
            src={`/images/quarto/sway-braco-${swaySuffix}.png`}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`quarto-arm${hoveredId === "toca-discos" ? " is-playing" : ""}`}
            style={{ left: "22.79%", top: "47.34%", width: "4.88%", height: "4.25%" }}
          />

          {/* porta: seta fina + convite, no vão de parede entre a planta e a
              porta (não cobre o mural). Visível no hover OU foco por teclado
              do hotspot; em touch, o próprio CSS mostra uma versão discreta
              sempre visível (ver DoorInvite.css). */}
          <DoorInvite visible={doorHover} night={roomDark} frozen={anyModalOpen} />

          {/* notas musicais brancas + giro leve do disco ao passar o mouse no toca-discos */}
          <div
            className={`quarto-turntable-fx${hoveredId === "toca-discos" ? " is-on" : ""}`}
            aria-hidden="true"
            style={{ left: "18.6%", top: "47.8%" }}
          >
            <span className="quarto-note quarto-note--1">♪</span>
            <span className="quarto-note quarto-note--2">♫</span>
            <span className="quarto-note quarto-note--3">♪</span>
          </div>
        </div>
      </RoomScene>

      {contactOpen && <FichaModal onClosed={() => setContactOpen(false)} />}
      {playlistOpen && <PlaylistModal onClosed={() => setPlaylistOpen(false)} />}
      {bookOpen && <BookReceiptModal onClosed={() => setBookOpen(false)} />}
      {note === "mural" && (
        <NoteModal
          onClosed={() => setNote(null)}
          originPoint={origin}
          title="quem tá por aqui"
          titleId="mural-note-title"
          chart={{
            ariaLabel: "Distribuição por gênero: 96,9% feminino, 3,1% outros",
            slices: [
              { label: "feminino", value: 96.9 },
              { label: "outros", value: 3.1 },
            ],
          }}
          fields={[
            { value: "96,9%", label: "público feminino", description: "da audiência" },
            { value: "76,4%", label: "entre 18 e 34 anos", description: "faixa etária mais presente" },
            { value: "46%", label: "tem 25 a 34 anos", description: "a faixa predominante" },
            { value: "95,6%", label: "público no Brasil", description: "2,6% em Portugal" },
          ]}
        />
      )}
      {note === "relogio" && (
        <NoteModal
          onClosed={() => setNote(null)}
          originPoint={origin}
          title="números de agora"
          titleId="clock-note-title"
          fields={[
            { value: "19,9 mil", label: "seguidores", description: "no Instagram" },
            { value: "2,07 mi", label: "visualizações", description: "orgânicas, em 30 dias" },
            { value: "90 mil", label: "interações", description: "nos últimos 30 dias" },
            { value: "+19,6%", label: "crescimento", description: "+3.270 seguidores em 30 dias" },
            { value: "23 mil", label: "visitas ao perfil", description: "nos últimos 30 dias" },
            { value: "122", label: "toques no link", description: "da bio, em 30 dias" },
          ]}
        />
      )}
    </>
  );
}
