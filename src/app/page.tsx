import AppShell from "@/components/AppShell";
import Site from "@/components/Site";

/**
 * Quarto ⇄ cozy corner por clique (porta / seta de voltar), não por
 * scroll — ver Site.tsx.
 */
export default function Home() {
  return (
    <AppShell>
      <main id="top" style={{ position: "relative" }}>
        <Site />
      </main>
    </AppShell>
  );
}
