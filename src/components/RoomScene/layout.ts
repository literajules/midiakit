/**
 * Cálculo do enquadramento de uma foto de cena (quarto, cozy corner...).
 * Função pura (sem React) — generalizada a partir de
 * literajules-site/src/components/CafeScene/layout.ts pra servir qualquer
 * cena baseada em RoomScene, cada uma com seu próprio tamanho de imagem.
 *
 * MODELO (reescrito — ver conversa "Ajuste de backgrounds — Fullscreen e
 * enquadramento inteligente"): a foto SEMPRE cobre 100% da tela, nos dois
 * eixos — sem faixas vazias, sem bordas, sem fundo desfocado/gradiente
 * simulando continuação da imagem. Dois modos só:
 *
 *  - "cover": a foto é escalada pra cobrir a tela inteira (como
 *    `object-fit: cover`) e o excesso é recortado. `focalX`/`focalY`
 *    (0–1, por padrão 0,5 = centro) escolhem QUAL PARTE da foto fica
 *    visível — nunca um recorte "center center" ingênuo: cada cena passa
 *    o ponto focal calculado a partir da prioridade real dos seus objetos
 *    (ver Quarto.tsx / CozyCorner.tsx, onde isso é documentado e
 *    justificado com as coordenadas dos hotspots).
 *
 *  - "pan": quando a foto é bem mais larga que a tela (tela alta e
 *    estreita — celular/tablet em pé) e cobrir cortaria DEMAIS dos lados
 *    (abaixo de `panTrigger`, a fração da largura que sobraria visível),
 *    a foto cobre a altura inteira (sem recorte vertical, sem blur, sem
 *    borda) e o visitante rola na horizontal pra ver o resto — nada é
 *    permanentemente cortado, só fica a um gesto de distância.
 *
 * Qual cena usa qual modo em qual faixa de tela não é escolhido por uma
 * lista de breakpoints: é uma CONSEQUÊNCIA de quanto da largura original
 * continua visível (`visibleWidthFraction`) comparado com `panTrigger` —
 * funciona em qualquer tamanho de tela, não só nos testados.
 */

export type SceneSize = { w: number; h: number };

export type SceneLayoutOptions = {
  /** x (0–1) do ponto focal do recorte — 0 = borda esquerda da foto, 1 = borda direita. Padrão 0,5 (centro). */
  focalX?: number;
  /** y (0–1) do ponto focal do recorte — 0 = topo da foto, 1 = base. Padrão 0,5 (centro). */
  focalY?: number;
  /**
   * Só importa quando a foto é mais larga (relativamente) que a tela —
   * ou seja, quando cobrir corta dos LADOS. Fração mínima da largura
   * original que precisa continuar visível pro modo "cover" ainda valer
   * a pena; abaixo disso, troca pro modo "pan" em vez de cortar mais que
   * isso de um dos lados. Padrão 0,5 (corta no máximo a metade da largura
   * original).
   */
  panTrigger?: number;
};

const DEFAULTS: Required<SceneLayoutOptions> = {
  focalX: 0.5,
  focalY: 0.5,
  panTrigger: 0.5,
};

export type SceneLayout = {
  mode: "cover" | "pan";
  /** tamanho do quadro, em px — sempre ≥ tela nos dois eixos (nunca sobra espaço vazio) */
  frameW: number;
  frameH: number;
  /** posição do quadro dentro da tela (normalmente ≤ 0 — o quadro é maior que a tela) */
  left: number;
  top: number;
};

export function computeSceneLayout(
  vw: number,
  vh: number,
  scene: SceneSize,
  options?: SceneLayoutOptions
): SceneLayout {
  const opts = { ...DEFAULTS, ...options };

  if (vw <= 0 || vh <= 0 || scene.w <= 0 || scene.h <= 0) {
    return { mode: "cover", frameW: 0, frameH: 0, left: 0, top: 0 };
  }

  const sceneAspect = scene.w / scene.h;
  const viewportAspect = vw / vh;

  // a foto é mais larga (relativamente) que a tela ⇒ cobrir recorta dos
  // LADOS. Só nesse caso o modo "pan" faz sentido (rolar na horizontal);
  // quando é a tela que é mais larga, cobrir recorta de cima/baixo — um
  // recorte bem menos destrutivo pra composição, sempre aceitável.
  if (sceneAspect > viewportAspect) {
    const visibleWidthFraction = viewportAspect / sceneAspect;
    if (visibleWidthFraction < opts.panTrigger) {
      return panLayout(vw, vh, scene);
    }
  }

  return coverLayout(vw, vh, scene, opts);
}

function coverLayout(vw: number, vh: number, scene: SceneSize, opts: Required<SceneLayoutOptions>): SceneLayout {
  const s = Math.max(vw / scene.w, vh / scene.h); // escala mínima que cobre os dois eixos
  const frameW = scene.w * s;
  const frameH = scene.h * s;
  const maxOffsetX = frameW - vw; // quanto do quadro "sobra" fora da tela, na horizontal
  const maxOffsetY = frameH - vh; // idem, na vertical

  return {
    mode: "cover",
    frameW,
    frameH,
    // focalX/focalY = 0 mostra a borda esquerda/superior da foto; = 1 mostra a direita/inferior.
    left: -maxOffsetX * opts.focalX,
    top: -maxOffsetY * opts.focalY,
  };
}

function panLayout(vw: number, vh: number, scene: SceneSize): SceneLayout {
  const sceneAspect = scene.w / scene.h;
  const frameH = vh; // cobre a altura inteira — sem blur, sem borda, sem sobra
  const frameW = frameH * sceneAspect; // > vw aqui dentro, por construção (ver computeSceneLayout)
  return { mode: "pan", frameW, frameH, left: 0, top: 0 };
}

/** scrollLeft que deixa o ponto focal (focalX) centralizado no modo pan */
export function focalScrollLeft(layout: SceneLayout, vw: number, focalX = 0.5) {
  const max = Math.max(0, layout.frameW - vw);
  return Math.min(max, Math.max(0, focalX * layout.frameW - vw / 2));
}
