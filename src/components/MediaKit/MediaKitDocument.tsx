import path from "path";
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { MEDIA_KIT_DATA } from "@/lib/mediaKitData";

/**
 * Mídia kit "de bolso" — uma página, gerada por código (não é um arquivo
 * estático exportado de um editor gráfico): texto vetorial nítido e
 * sempre a partir dos mesmos dados de `mediaKitData.ts`.
 *
 * Visual de scrapbook, com os elementos reais que a Jules separou (ver
 * `./assets` — já processados em `scripts`/sessão anterior: fundo branco/
 * preto removido via `sharp`, virou PNG com transparência de verdade):
 * papel de caderno (fundo), fita washi "colando" o photobooth, rendinha
 * como divisor, clipe de papel e prendedor como acentos, pastinha rosa
 * pros nichos/formatos, estrelinha dourada marcando o destaque.
 *
 * Só Helvetica (fonte padrão do react-pdf, sem precisar registrar/carregar
 * nenhuma fonte extra) — a personalidade visual vem dos elementos, não da
 * tipografia. Esta é uma primeira calibração visual das posições (`top`/
 * `left` dos elementos soltos); como todo elemento "medido a olho" neste
 * projeto, pode precisar de um ajuste fino depois de ver o PDF de verdade.
 */

const ASSETS = path.join(process.cwd(), "src/components/MediaKit/assets");
const asset = (file: string) => path.join(ASSETS, file);

const COLOR = {
  burgundy: "#521010",
  pink: "#e8aebb",
  cream: "#f3e6cc",
  offWhite: "#f7f4ee",
  ink: "#1c140d",
  muted: "#7a6a63",
};

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    position: "relative",
    fontFamily: "Helvetica",
  },
  bgNotebook: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  content: {
    position: "relative",
    paddingTop: 54,
    paddingBottom: 40,
    paddingLeft: 78,
    paddingRight: 48,
  },

  /* ——— cabeçalho ——— */
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 14,
  },
  photoboothWrap: {
    position: "relative",
    width: 70,
  },
  photobooth: {
    width: 70,
    objectFit: "contain",
  },
  washiOnPhoto: {
    position: "absolute",
    top: -14,
    left: 10,
    width: 56,
    transform: "rotate(-7deg)",
  },
  headerText: {
    flex: 1,
  },
  kicker: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: COLOR.muted,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: COLOR.burgundy,
  },
  handle: {
    fontSize: 11,
    color: COLOR.burgundy,
    marginTop: 2,
  },
  tagline: {
    fontSize: 10,
    color: COLOR.ink,
    marginTop: 6,
    fontFamily: "Helvetica-Oblique",
  },
  bioLine: {
    fontSize: 9,
    color: COLOR.muted,
    marginTop: 2,
  },

  lace: {
    width: "100%",
    height: 16,
    objectFit: "cover",
    marginBottom: 16,
  },

  /* ——— seções ——— */
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLOR.burgundy,
  },
  starAccent: {
    width: 14,
    marginLeft: 6,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: 118,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLOR.pink,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: COLOR.burgundy,
  },
  statLabel: {
    fontSize: 7.5,
    color: COLOR.muted,
    marginTop: 3,
    lineHeight: 1.3,
  },

  /* ——— pastas: nichos / formatos ——— */
  foldersRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 24,
  },
  folderBlock: {
    flex: 1,
    position: "relative",
    paddingTop: 6,
  },
  folderIcon: {
    position: "absolute",
    top: -10,
    right: 6,
    width: 26,
    opacity: 0.9,
  },
  folderLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLOR.burgundy,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    fontSize: 8.5,
    color: COLOR.burgundy,
    backgroundColor: "rgba(232,174,187,0.55)",
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
  },

  /* ——— rodapé / contato ——— */
  footer: {
    position: "relative",
    marginTop: 8,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: COLOR.pink,
    borderTopStyle: "dashed",
    alignItems: "center",
  },
  clipAccent: {
    position: "absolute",
    top: -26,
    left: "50%",
    width: 20,
    transform: "translateX(-50%)",
  },
  footerText: {
    fontSize: 13,
    fontFamily: "Helvetica-BoldOblique",
    color: COLOR.burgundy,
    marginBottom: 6,
  },
  footerContact: {
    fontSize: 9.5,
    color: COLOR.ink,
  },
  footerLink: {
    fontSize: 9,
    color: COLOR.muted,
    marginTop: 2,
  },
  binderClipTop: {
    position: "absolute",
    top: 0,
    left: "50%",
    width: 46,
    transform: "translateX(-50%)",
  },
});

export default function MediaKitDocument() {
  const d = MEDIA_KIT_DATA;

  return (
    <Document title={`Mídia kit · ${d.handle}`} author={d.name}>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={asset("notebook.jpg")} style={styles.bgNotebook} />
        {/* prendedor "clipando" o topo da página, igual uma prancheta */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={asset("binderclip.png")} style={styles.binderClipTop} />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.photoboothWrap}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={asset("photobooth.png")} style={styles.photobooth} />
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={asset("washi.png")} style={styles.washiOnPhoto} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.kicker}>mídia kit · versão de bolso</Text>
              <Text style={styles.title}>literajules</Text>
              <Text style={styles.handle}>{d.handle}</Text>
              <Text style={styles.tagline}>&ldquo;{d.tagline}&rdquo;</Text>
              <Text style={styles.bioLine}>{d.bio}</Text>
            </View>
          </View>

          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={asset("lace.png")} style={styles.lace} />

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>números de agora</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={asset("star.png")} style={styles.starAccent} />
          </View>
          <View style={styles.statsGrid}>
            {d.stats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>quem tá por aqui</Text>
          <View style={styles.statsGrid}>
            {d.audience.map((a) => (
              <View key={a.label} style={styles.statCard}>
                <Text style={styles.statValue}>{a.value}</Text>
                <Text style={styles.statLabel}>{a.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.foldersRow}>
            <View style={styles.folderBlock}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={asset("folder.png")} style={styles.folderIcon} />
              <Text style={styles.folderLabel}>nichos</Text>
              <View style={styles.chipsRow}>
                {d.niches.map((n) => (
                  <Text key={n} style={styles.chip}>
                    {n}
                  </Text>
                ))}
              </View>
            </View>
            <View style={styles.folderBlock}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={asset("folder.png")} style={styles.folderIcon} />
              <Text style={styles.folderLabel}>formatos</Text>
              <View style={styles.chipsRow}>
                {d.formats.map((f) => (
                  <Text key={f} style={styles.chip}>
                    {f}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={asset("clip.png")} style={styles.clipAccent} />
            <Text style={styles.footerText}>vamos criar algo juntas? ♡</Text>
            <Text style={styles.footerContact}>{d.email}</Text>
            <Text style={styles.footerLink}>{d.link}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
