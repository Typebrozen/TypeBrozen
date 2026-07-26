// ======================================================
// Custom Paragraph — Format Detection + Safety Filter
//
// User jo bhi text paste kare, hum:
// 1. Pehchante hain ki wo Mangal (Unicode) hai ya Krutidev (ASCII)
// 2. Har word ko humare hi keyboard-logic se "simulate" karke check
//    karte hain ki poora type ho sakta hai ya nahi
// 3. Jo words type nahi ho sakte, unhe CHUPCHAAP hata dete hain —
//    koi error kabhi nahi dikhate, test hamesha smoothly chalta hai
// ======================================================

import { MANGAL_KEYMAP, NUKTA_KEYMAP } from "../layouts/mangal-keymap";
import { KRUTI_EXTENDED_KEYMAP } from "../layouts/krutidev-extended";
import { CODE_TO_BASE_KEY, SHIFT_SYMBOL } from "./physicalKey";
import { getNextKeyInfo } from "./nextKey";

const DEVANAGARI_RANGE = /[\u0900-\u097F]/;

// Agar text mein real Devanagari Unicode characters hain, wo Mangal hai.
// Warna (sirf plain ASCII letters/symbols), wo Krutidev hai.
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

// Krutidev mein sirf wahi characters "asli/typeable" hain jo kisi physical
// key se seedha ya Shift se ya AltGr se milte hain — humne ye poori list
// pehle hi verify ki thi (61 characters, sab keys). Ye hamesha "haan"
// bolne ki purani bhool se bachne ke liye ab exact check karta hai.
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
}

export function prepareCustomParagraph(
  text: string,
  mode: "mangal" | "krutidev"
): PreparedCustomText {
  const words = text.split(/\s+/).filter(Boolean);
  const isTypeable = mode === "krutidev" ? isKrutiWordTypeable : isMangalWordTypeable;

  const kept: string[] = [];
  let skipped = 0;
  for (const w of words) {
    if (isTypeable(w)) kept.push(w);
    else skipped++;
  }

  return { paragraph: kept.join(" "), skippedCount: skipped, totalWords: words.length };
}