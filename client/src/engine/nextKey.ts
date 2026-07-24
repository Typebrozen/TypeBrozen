import { MANGAL_KEYMAP, NUKTA_KEYMAP } from "../layouts/mangal-keymap";
import { isShiftedLabel } from "./physicalKey";

export interface NextKeyInfo {
  label: string;
  shift: boolean;
  altGr?: boolean;
}

const CHAR_TO_LABEL: Record<string, string> = {};
for (const [label, char] of Object.entries(MANGAL_KEYMAP)) {
  if (!(char in CHAR_TO_LABEL) || !isShiftedLabel(label)) {
    CHAR_TO_LABEL[char] = label;
  }
}

// Nukta letters ka reverse-lookup alag table mein — normal letters
// ke saath mix nahi karna, kyunki inko AltGr chahiye, Shift nahi.
const CHAR_TO_ALTGR_LABEL: Record<string, string> = {};
for (const [label, char] of Object.entries(NUKTA_KEYMAP)) {
  CHAR_TO_ALTGR_LABEL[char] = label;
}

export function getNextKeyInfo(char: string | undefined): NextKeyInfo | null {
  if (!char) return null;

  const altGrLabel = CHAR_TO_ALTGR_LABEL[char];
  if (altGrLabel) {
    return { label: altGrLabel, shift: false, altGr: true };
  }

  const label = CHAR_TO_LABEL[char];
  if (!label) return null;
  return { label, shift: isShiftedLabel(label) };
}