"use client";
import { useLanguage } from "@/components/Language";

import SceneModal from "@/components/SceneModal/SceneModal";
import Receipt from "@/components/Receipt/Receipt";
import "./BookReceiptModal.css";

/**
 * Conteúdo aberto pelo livro na cama (estante substituída pela Opção B —
 * ver MIDIA-KIT-REUSO.md). Não é uma lista de recomendações: é o recibo
 * "o que tá rolando por aqui agora", no formato que a Jules mandou de
 * referência. Data/pedido são calculados no momento em que a visita abre o
 * recibo (ver Receipt.tsx).
 *
 * Ainda NÃO está conectado a nenhum hotspot — o livro só existe na imagem
 * do quarto quando a Jules adicionar o asset. Este componente já fica
 * pronto pra esse momento.
 */
export default function BookReceiptModal({ onClosed }: { onClosed: () => void }) {
  const { t } = useLanguage();
  return (
    <SceneModal onClosed={onClosed} dialogClassName="book-receipt-modal" aria-labelledby="book-receipt-title">
      <h2 id="book-receipt-title" className="sr-only">
        {t("Recibo — o que tá rolando por aqui", "Receipt — what’s happening around here")}
      </h2>
      <Receipt
        shopName="Julia's Café"
        location="São Paulo"
        subtitle={t("o que tá rolando por aqui", "what’s happening around here")}
        fields={[
          { label: t("bebendo", "drinking"), value: "iced vanilla matcha latte" },
          { label: t("trabalhando em", "working on"), value: t("projetos incríveis com marcas + esse site", "lovely brand projects + this website") },
          { label: t("lendo", "reading"), value: t("alguma romantasia, provavelmente.", "some romantasy, probably.") },
          { label: t("ouvindo", "listening to"), value: "harry styles, olivia rodrigo & tate mccrae <3" },
        ]}
        thankYouLine={t("obrigada", "thank you")}
        comeAgainLine={t("volte em breve", "come back soon")}
      />
    </SceneModal>
  );
}
