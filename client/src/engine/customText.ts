// ======================================================
// Custom Paragraph — koi bhi mode (Mangal/Krutidev), koi bhi
// format ka paste kiya text — usi mode mein typeable ban jata hai.
// User jo mode select kare, wahi rahega — hum sirf text ko
// zaroorat padne par convert karte hain, mode kabhi khud
// nahi badalte.
// ======================================================

import { MANGAL_KEYMAP, NUKTA_KEYMAP } from "../layouts/mangal-keymap";
import { KRUTI_EXTENDED_KEYMAP } from "../layouts/krutidev-extended";
import { CODE_TO_BASE_KEY, SHIFT_SYMBOL } from "./physicalKey";
import { getNextKeyInfo } from "./nextKey";
import { kru2uni } from "./kru2uni";
import { uni2kru } from "./uni2kru";

const DEVANAGARI_RANGE = /[\u0900-\u097F]/;

export function detectHindiFormat(text: string): "mangal" | "krutidev" {
  return DEVANAGARI_RANGE.test(text) ? "mangal" : "krutidev";
}

function isMangalWordTypeable(word: string): boolean {
  let typed = "";
  let guard = 0;
  while (typed.length < word.length) {
    guard++;
    if (guard > 50) return false;
    const hint = getNextKeyInfo(word.slice(typed.length));
    if (!hint) return false;
    const appended = hint.altGr ? NUKTA_KEYMAP[hint.label] : MANGAL_KEYMAP[hint.label];
    if (appended === undefined) return false;
    typed += appended;
  }
  return typed === word;
}

const KRUTI_REACHABLE_CHARS = (() => {
  const set = new Set<string>();
  for (const base of Object.values(CODE_TO_BASE_KEY)) {
    set.add(base);
    if (/^[a-z]$/.test(base)) set.add(base.toUpperCase());
    if (SHIFT_SYMBOL[base]) set.add(SHIFT_SYMBOL[base]);
  }
  for (const ch of Object.values(KRUTI_EXTENDED_KEYMAP)) set.add(ch);
  return set;
})();

function isKrutiWordTypeable(word: string): boolean {
  for (const ch of word) {
    if (!KRUTI_REACHABLE_CHARS.has(ch)) return false;
  }
  return true;
}

export interface PreparedCustomText {
  paragraph: string;
  skippedCount: number;
  totalWords: number;
  wasConverted: boolean;
}

// targetMode = jo mode USER NE KHUD select kiya hai (Mangal ya Krutidev
// button dabakar) — ye kabhi nahi badalta. Hum sirf paste kiye gaye
// text ko, zaroorat padne par, USI mode ke format mein convert karte hain.
export function prepareCustomParagraph(
  text: string,
  targetMode: "mangal" | "krutidev"
): PreparedCustomText {
  const pastedFormat = detectHindiFormat(text);
  const wasConverted = pastedFormat !== targetMode;

  let finalText = text;
  if (targetMode === "krutidev" && pastedFormat === "mangal") {
    finalText = uni2kru(text);
  } else if (targetMode === "mangal" && pastedFormat === "krutidev") {
    finalText = kru2uni(text);
  }

  const isTypeable = targetMode === "krutidev" ? isKrutiWordTypeable : isMangalWordTypeable;
  const words = finalText.split(/\s+/).filter(Boolean);
  const kept: string[] = [];
  let skipped = 0;
  for (const w of words) {
    if (isTypeable(w)) kept.push(w);
    else skipped++;
  }

  return {
    paragraph: kept.join(" "),
    skippedCount: skipped,
    totalWords: words.length,
    wasConverted,
  };
}