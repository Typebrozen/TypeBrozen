// ======================================================
// Next-Key Lookup
// Given the Hindi character the lesson needs next, finds
// which key label produces it in MANGAL_KEYMAP. Reads the
// SAME map used for typing, so this can never fall out of
// sync with what actually happens when you press a key.
// ======================================================

import { MANGAL_KEYMAP } from "../layouts/mangal-keymap";
import { isShiftedLabel } from "./physicalKey";

export interface NextKeyInfo {
  label: string; // canonical key label, e.g. "k", "K", "["
  shift: boolean;
}

// Reverse lookup: Hindi char -> key label. Built once at module load.
const CHAR_TO_LABEL: Record<string, string> = {};
for (const [label, char] of Object.entries(MANGAL_KEYMAP)) {
  // A couple of chars have two labels mapping to them (e.g. ] and }
  // both give ञ) — prefer the unshifted one for beginner guidance.
  if (!(char in CHAR_TO_LABEL) || !isShiftedLabel(label)) {
    CHAR_TO_LABEL[char] = label;
  }
}

export function getNextKeyInfo(char: string | undefined): NextKeyInfo | null {
  if (!char) return null;
  const label = CHAR_TO_LABEL[char];
  if (!label) return null;
  return { label, shift: isShiftedLabel(label) };
}