"use client";

import DesktopWindow from "./DesktopWindow";
import "./AboutMeWindow.css";

type Props = {
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
  initialOffset?: { x: number; y: number };
};

/**
 * Conteúdo da pasta "Sobre mim" (`inspo` em folders.ts) — diferente das
 * outras pastas do desktop (Entregas/Conteúdos, ver FolderWindow.tsx, grade
 * de cases de marca): aqui não tem grade nem item clicável, é uma página
 * editorial só, texto fixo da Jules (ver conversa "implemente o texto
 * acima") + um pequeno collage de fotos pessoais — por isso vive num
 * componente próprio em vez de mais um branch dentro do FolderWindow
 * genérico, que foi pensado pra outra coisa (cases com vídeo/badges).
 *
 * Texto reproduzido EXATAMENTE como a Jules escreveu (pontuação, minúsculas
 * e tudo) — só os 5 trechos que ela marcou em **negrito** no texto
 * original ganharam um tratamento visual (itálico serifado / peso forte /
 * grifo rosa), cada um um pouco diferente dos outros de propósito (ver
 * `.about-me__accent--*` em AboutMeWindow.css) — "hierarquia visual
 * natural", não a mesma marcação repetida 5 vezes.
 *
 * Fotos (ver public/images/desktop/about/): escolhidas das que a Jules
 * mandou na pasta `sobre mim` do scrapbook — fiquei só com as que têm cara
 * de "pessoal/cotidiano" (fotomaton, selfie, bastidor filmando, matcha).
 * Duas fotos de evento de marca (parceria Risqué/KitKat) e uma print de
 * app ficaram de fora dessa página — combinam mais com "Entregas" (cases)
 * do que com um texto íntimo sobre histórias/cafés/livros.
 */
export default function AboutMeWindow({ onClose, onFocus, zIndex, initialOffset }: Props) {
  return (
    <DesktopWindow
      className="about-me-window"
      title="Sobre mim"
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
      initialOffset={initialOffset}
    >
      <div className="about-me">
        <div className="about-me__photos" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/desktop/about/about-triptych.webp" alt="" className="about-me__photo about-me__photo--triptych" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/desktop/about/about-selfie.webp" alt="" className="about-me__photo about-me__photo--selfie" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/desktop/about/about-bts.webp" alt="" className="about-me__photo about-me__photo--bts" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/desktop/about/about-matcha.webp" alt="" className="about-me__photo about-me__photo--matcha" />
        </div>

        <div className="about-me__text">
          <h3 className="about-me__title">a little bit about me. ♡</h3>

          <p className="about-me__p">oi, eu sou a jules.</p>

          <p className="about-me__p">
            tenho 27 anos, sou formada em publicidade e sempre fui o tipo de pessoa que encontra{" "}
            <span className="about-me__accent about-me__accent--highlight">histórias em absolutamente tudo.</span> nos
            livros que leio, nos lugares que visito, nas conversas que tenho e, principalmente, nos pequenos detalhes
            do cotidiano.
          </p>

          <p className="about-me__p">
            por muito tempo, achei que precisava ter <span className="about-me__accent about-me__accent--bold">tudo planejado</span> antes
            de começar a viver a minha própria história. segui caminhos, conquistei coisas que um dia fizeram parte
            dos meus planos e descobri que{" "}
            <span className="about-me__accent about-me__accent--italic">
              realizar sonhos nem sempre significa se sentir realizada.
            </span>
          </p>

          <p className="about-me__p">foi assim que comecei a olhar para a vida de um jeito diferente.</p>

          <p className="about-me__p">
            hoje, entre cafés, livros, novos hobbies e uma quantidade considerável de pensamentos por minuto, estou
            aprendendo a{" "}
            <span className="about-me__accent about-me__accent--bold">criar uma vida que tenha a minha cara.</span>
          </p>

          <p className="about-me__p">
            e, de alguma forma, transformar esses pequenos momentos em{" "}
            <span className="about-me__accent about-me__accent--highlight">histórias que merecem ser contadas.</span>
          </p>

          <p className="about-me__signature">still figuring it out, one little chapter at a time. ✷</p>
        </div>
      </div>
    </DesktopWindow>
  );
}
