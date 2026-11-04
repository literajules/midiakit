/**
 * Tipos dos hotspots — compartilhados por todas as cenas (quarto, cozy
 * corner, ...). Sem React: só os dados.
 *
 * Coordenadas são sempre PORCENTAGENS DA IMAGEM ORIGINAL da cena (não da
 * tela): cx, cy = centro do objeto; w, h = tamanho da área clicável. Como o
 * "quadro" que contém a foto sempre tem a mesma proporção da imagem (ver
 * layout.ts), esses valores valem em qualquer tela.
 */

export type HotspotShape = "rect" | "ellipse";

export type HotspotDef = {
  id: string;
  /** nome do objeto, como aparece no modo de teste */
  label: string;
  /** o que esse objeto vai abrir (descrição; não é link) */
  destination: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  /** não afeta mais a aparência (o marcador visual agora é sempre o "+"
   * centralizado, ver Hotspot.tsx) — só documenta a forma "real" do objeto. */
  shape?: HotspotShape;
  /**
   * Texto do tooltip visível no hover/foco — o que aquele clique REVELA
   * (ex. "café?", "my jams"), não o nome do objeto. `label` continua
   * existindo pro aria-label e pro modo de teste (onde saber o nome do
   * objeto/id ajuda a calibrar posição); sem `teaser`, o tooltip cai de
   * volta pro `label` (comportamento antigo).
   */
  teaser?: string;
  /**
   * `false` = a experiência ainda não existe / a posição ainda não foi
   * medida na arte final. Na versão pública o hotspot não é renderizado;
   * em modo de teste (HOTSPOT_DEBUG) ele aparece do mesmo jeito, pra dar
   * pra calibrar posição antes de ligar de verdade.
   */
  enabled?: boolean;
};
