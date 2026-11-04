import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono, Homemade_Apple, Playfair_Display } from "next/font/google";
import CustomCursor from "@/components/CustomCursor/CustomCursor";
import SoundToggle from "@/components/SoundToggle/SoundToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// fonte manuscrita pro convite da porta ("vamos tomar um café?")
const homemadeApple = Homemade_Apple({
  variable: "--font-homemade-apple",
  weight: "400",
  subsets: ["latin"],
});

// serifadas "editoriais" — só pra pasta "Sobre mim" do desktop
// (AboutMeWindow.tsx/.css): título grande (Playfair, com o peso usado em
// capa de revista) + corpo do texto (Cormorant, lê bem em parágrafo, tem
// itálico de verdade pra os destaques e pra assinatura final).
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "@literajules — mídia kit interativo",
  description: "Mídia kit interativo da @literajules: um dollhouse cozy, cômodo por cômodo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${homemadeApple.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CustomCursor />
        <SoundToggle />
        {children}
      </body>
    </html>
  );
}
