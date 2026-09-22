import type { Mcq } from "./curriculum";
import type { Lang } from "./i18n";

/** Question bilingue d'une leçon d'instrument (basse / batterie). */
export type InstQuestion = {
  qFr: string;
  qEn: string;
  optionsFr: string[];
  optionsEn: string[];
  answer: number;
  explainFr: string;
  explainEn: string;
};

export type InstLesson = {
  id: string;
  titleFr: string;
  titleEn: string;
  introFr: string[];
  introEn: string[];
  questions: InstQuestion[];
};

export type InstExam = {
  id: string;
  titleFr: string;
  titleEn: string;
  leadFr: string;
  leadEn: string;
  questions: InstQuestion[];
};

export function instQuestions(lang: Lang, list: InstQuestion[]): Mcq[] {
  return list.map((q) => ({
    q: lang === "en" ? q.qEn : q.qFr,
    options: lang === "en" ? q.optionsEn : q.optionsFr,
    answer: q.answer,
    explain: lang === "en" ? q.explainEn : q.explainFr,
  }));
}

/** Déblocage séquentiel dans un mini-parcours (leçon 1 toujours ouverte). */
export function instUnlocked(order: string[], completed: string[], id: string): boolean {
  const idx = order.indexOf(id);
  if (idx === 0) return true;
  if (idx < 0) return false;
  return completed.includes(order[idx - 1]);
}
