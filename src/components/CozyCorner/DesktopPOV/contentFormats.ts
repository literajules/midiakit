/**
 * Exemplos de formato de conteúdo mostrados na pasta "Conteúdos" do
 * desktop POV — mesmo mecanismo e mesmo tipo `ProjectCase` da pasta
 * "Entregas" (ver projects.ts), só que sem `brand`: aqui não é uma
 * parceria com marca, é um formato/pilar de conteúdo que a Jules trabalha
 * por conta própria (ex. "cozy lifestyle", "resenha de livro", "UGC",
 * "day in the life"). Use `title` pro nome do formato e `description`
 * pra explicar o que é/como ela trabalha nele; `imageUrl`/`videoUrl` pro
 * exemplo.
 *
 * Vazio até a Jules mandar os formatos reais + um exemplo de cada —
 * mesma regra das outras pastas: nada inventado aqui.
 */

import type { ProjectCase } from "./projects";

export const CONTENT_FORMATS: ProjectCase[] = [];

/** Lista que a interface usa — hoje sempre igual a CONTENT_FORMATS. */
export const visibleContentFormats: ProjectCase[] = CONTENT_FORMATS;
