import type { Metadata } from "next";
import { Geist, Geist_Mono, Homemade_Apple } from "next/font/google";
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

export const metadata: Metadata = {
  title: "@literajules — mídia kit interativo",
  description: "Mídia kit interativo da @literajules: um dollhouse cozy, cômodo por cômodo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${homemadeApple.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CustomCursor />
        <SoundToggle />
        {children}
      </body>
    </html>
  );
}
