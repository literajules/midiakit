import { renderToBuffer } from "@react-pdf/renderer";
import MediaKitDocument from "@/components/MediaKit/MediaKitDocument";

/**
 * Gera o mídia kit em PDF na hora (não é um arquivo estático em
 * `/public`) — sempre reflete `src/lib/mediaKitData.ts`. Roda no runtime
 * padrão (Node — Route Handlers já nascem nele, Edge é opt-in): o
 * `@react-pdf/renderer` usa APIs do Node (fs, Buffer) que não existem no
 * Edge Runtime. Não dá pra forçar `export const runtime = "nodejs"` aqui
 * porque esse projeto tem `cacheComponents` ligado (`next.config.ts`), e
 * essa config não é compatível com declarar `runtime` manualmente — como
 * já é o padrão mesmo, só não declarar resolve.
 */
export async function GET() {
  const buffer = await renderToBuffer(MediaKitDocument());

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="literajules-media-kit.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
