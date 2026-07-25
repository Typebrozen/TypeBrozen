import { MANGAL_KEYMAP, NUKTA_KEYMAP } from "../layouts/mangal-keymap";
import { isShiftedLabel } from "./physicalKey";

export interface NextKeyInfo {
  label: string;
  shift: boolean;
  altGr?: boolean;
}

// Kuch Devanagari letters (nukta wale, jaise ड़, ढ़) do Unicode code-units
// mein store hote hain — ek hi "look" ke pichhe 2 raw characters chhupe
// hote hain. Isliye hum sirf 1 character dekh kar faisla nahi kar sakte
// ki kaunsi key dabani hai — humein "aage se sabse lamba matching
// sequence" dhoondhna hoga (longest-prefix match), taaki 2-piece letters
// bhi sahi se pakde jayein.

const CHAR_TO_LABEL: Record<string, string> = {};
for (const [label, char] of Object.entries(MANGAL_KEYMAP)) {
  if (!(char in CHAR_TO_LABEL) || !isShiftedLabel(label)) {
    CHAR_TO_LABEL[char] = label;
  }
}

const CHAR_TO_ALTGR_LABEL: Record<string, string> = {};
for (const [label, char] of Object.entries(NUKTA_KEYMAP)) {
  CHAR_TO_ALTGR_LABEL[char] = label;
}

// remainingText = word ka wo hissa jo abhi tak type nahi hua
// (activeWord.slice(typed.length) — poora baaki text, sirf ek char nahi)
export function getNextKeyInfo(remainingText: string | undefined): NextKeyInfo | null {
  if (!remainingText) return null;

  const twoUnit = remainingText.slice(0, 2);
  const oneUnit = remainingText.slice(0, 1);

  // Pehle 2-code-unit letters check karo (jaise nukta wale) — lambe
  // matches ko pehle priority do, warna ek chhota match galat pakड़ lega.
  if (CHAR_TO_ALTGR_LABEL[twoUnit]) {
    return { label: CHAR_TO_ALTGR_LABEL[twoUnit], shift: false, altGr: true };
  }
  if (CHAR_TO_LABEL[twoUnit]) {
    const label = CHAR_TO_LABEL[twoUnit];
    return { label, shift: isShiftedLabel(label) };
  }

  // Fir normal single-character letters
  if (CHAR_TO_ALTGR_LABEL[oneUnit]) {
    return { label: CHAR_TO_ALTGR_LABEL[oneUnit], shift: false, altGr: true };
  }
  const label = CHAR_TO_LABEL[oneUnit];
  if (!label) return null;
  return { label, shift: isShiftedLabel(label) };
}