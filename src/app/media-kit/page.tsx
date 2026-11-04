import type { Metadata } from "next";
import MediaKitPage from "@/components/MediaKit/MediaKitPage";

export const metadata: Metadata = {
  title: "Mídia kit · literajules",
  description: "Mídia kit de bolso da literajules — números, nichos e formatos de entrega.",
};

/**
 * Rota própria (fora da SPA de `Site.tsx`) — a `FichaModal` abre ela numa
 * aba nova. É uma página HTML normal (não um PDF gerado por código): o
 * "baixar" é o próprio botão "salvar como PDF" do diálogo de impressão do
 * navegador (`window.print()`, em `MediaKitPage.tsx`) — ver a conversa
 * "media kit sem elemento/formatação" pro porquê de ter trocado de
 * abordagem (gerar PDF por código com `@react-pdf/renderer` tava dando
 * problema de carregamento de imagem; HTML/CSS é a mesma tecnologia que
 * já funciona em todo o resto do site).
 */
export default function Page() {
  return <MediaKitPage />;
}
