"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
type Language = "pt" | "en";
const Context = createContext({ language: "pt" as Language, setLanguage: (_next: Language) => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        if (localStorage.getItem("literajules-language") === "en") setLanguage("en");
      } catch {}
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "pt-BR";
  }, [language]);

  return (
    <Context.Provider value={{ language, setLanguage: (next) => {
      setLanguage(next);
      try { localStorage.setItem("literajules-language", next); } catch {}
    } }}>
      {children}
    </Context.Provider>
  );
}

export function useLanguage() {
  const { language, setLanguage } = useContext(Context);
  return { language, setLanguage, t: (pt: string, en: string) => language === "en" ? en : pt };
}
