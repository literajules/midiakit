/**
 * "Corner pin" — matemática de transformação projetiva 2D (homografia),
 * pra encaixar um retângulo (um "canvas" HTML normal, sem distorção) nos
 * 4 cantos de um quadrilátero qualquer, via CSS `matrix3d`. Usado pela
 * miniatura do desktop na tela do laptop (ver MiniDesktopScreen.tsx): a
 * tela foi fotografada em ângulo, então não é um retângulo "de frente" —
 * uma rotação/escala simples não encaixaria nos 4 cantos reais, só uma
 * transformação projetiva de verdade.
 *
 * Álgebra padrão (não é conteúdo específico deste projeto — é a técnica
 * conhecida de "mapear um quadrado unitário em 4 pontos arbitrários",
 * usada em qualquer "corner pin"/"CSS perspective transform"): calcula a
 * homografia H tal que H·(0,0,1)→p0, H·(1,0,1)→p1, H·(1,1,1)→p2,
 * H·(0,1,1)→p3, depois converte H (3×3) pro formato `matrix3d` (4×4) que
 * o CSS entende.
 */

export type Point = { x: number; y: number };

type Mat3 = [number, number, number, number, number, number, number, number, number];

function adj(m: Mat3): Mat3 {
  const [a, b, c, d, e, f, g, h, i] = m;
  return [
    e * i - f * h,
    c * h - b * i,
    b * f - c * e,
    f * g - d * i,
    a * i - c * g,
    c * d - a * f,
    d * h - e * g,
    b * g - a * h,
    a * e - b * d,
  ];
}

function multMM(a: Mat3, b: Mat3): Mat3 {
  const c = new Array(9).fill(0) as number[];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) sum += a[i * 3 + k] * b[k * 3 + j];
      c[i * 3 + j] = sum;
    }
  }
  return c as Mat3;
}

function multMV(m: Mat3, v: [number, number, number]): [number, number, number] {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

/** manda os 4 pontos-base (1,0),(0,1),(0,0) + um 4º ponto de controle pra
 * essa base — resultado: a matriz que leva o quadrado unitário nesses 4 pontos. */
function basisToPoints(p1: Point, p2: Point, p3: Point, p4: Point): Mat3 {
  const m: Mat3 = [p1.x, p2.x, p3.x, p1.y, p2.y, p3.y, 1, 1, 1];
  const v = multMV(adj(m), [p4.x, p4.y, 1]);
  return multMM(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
}

/**
 * Homografia que leva o quadrado unitário (0,0)→tl, (1,0)→tr, (1,1)→br,
 * (0,1)→bl nos 4 pontos de destino (em px, relativos ao mesmo elemento
 * que vai receber o `transform`).
 */
function unitSquareToQuad(tl: Point, tr: Point, br: Point, bl: Point): Mat3 {
  return multMM(basisToPoints(tl, tr, br, bl), adj(basisToPoints({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 })));
}

/**
 * Matriz final: do retângulo `width`×`height` (o canvas de verdade, sem
 * distorção) pros 4 cantos de destino — já pronta pra virar `matrix3d`
 * (ver `cssMatrix3d`). Equivale a escalar o quadrado unitário pro tamanho
 * do canvas antes de aplicar a homografia.
 */
export function rectToQuadMatrix(width: number, height: number, corners: { tl: Point; tr: Point; br: Point; bl: Point }): Mat3 {
  const unit = unitSquareToQuad(corners.tl, corners.tr, corners.br, corners.bl);
  const scale: Mat3 = [1 / width, 0, 0, 0, 1 / height, 0, 0, 0, 1];
  return multMM(unit, scale);
}

/** Converte a matriz 3×3 (projetiva 2D) numa string `matrix3d(...)` —
 * fórmula padrão de conversão homografia-2D → matrix3d CSS. */
export function cssMatrix3d(t: Mat3): string {
  const w = t[8] || 1;
  return [
    t[0] / w, t[3] / w, 0, t[6] / w,
    t[1] / w, t[4] / w, 0, t[7] / w,
    0, 0, 1, 0,
    t[2] / w, t[5] / w, 0, 1,
  ].join(",");
}
