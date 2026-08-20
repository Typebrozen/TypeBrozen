// ======================================================
// GAIL Next-Key Guide
// ======================================================
// Target word Unicode Hindi mein hai, lekin GAIL mein user ko
// batana hai ki kaunsi RAW ASCII key (Kruti Dev jaisi) dabani
// hai. uni2kru baaki bache hue poore word ko convert karta hai
// — kyunki kabhi-kabhi ek Unicode character banane ke liye
// pichle typed characters ka context chahiye hota hai (jaise
// reph, chhoti-i repositioning). Humein bas result ka PEHLA
// raw character chahiye — wahi agli key hai.
// ======================================================

import { isShiftedLabel } from "./physicalKey";
import { uni2kru } from "./uni2kru";

export interface NextKeyInfo {
  label: string;
  shift: boolean;
}

export function getNextGailKeyInfo(remainingUnicodeText: string): NextKeyInfo | null {
  if (!remainingUnicodeText) return null;

  const rawKru = uni2kru(remainingUnicodeText);
  if (!rawKru) return null;

  const rawChar = rawKru[0];
  const isShifted = isShiftedLabel(rawChar) || /[A-Z]/.test(rawChar);

  return { label: rawChar, shift: isShifted };
}