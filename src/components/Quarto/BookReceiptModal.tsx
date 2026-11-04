"use client";

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
  return (
    <SceneModal onClosed={onClosed} dialogClassName="book-receipt-modal" aria-labelledby="book-receipt-title">
      <h2 id="book-receipt-title" className="sr-only">
        Recibo — o que tá rolando por aqui
      </h2>
      <Receipt
        shopName="Julia's Café"
        location="São Paulo"
        subtitle="o que tá rolando por aqui"
        fields={[
          { label: "bebendo", value: "iced vanilla matcha latte" },
          { label: "trabalhando em", value: "projetos incríveis com marcas + esse site" },
          { label: "lendo", value: "alguma romantasia, provavelmente." },
          { label: "ouvindo", value: "harry styles, olivia rodrigo & tate mccrae <3" },
        ]}
        thankYouLine="obrigada"
        comeAgainLine="volte em breve"
      />
    </SceneModal>
  );
}
