// ======================================================
// Krutidev me typed character hi seedha keyboard label hai
// (kyunki Krutidev me physical key -> raw ASCII char hota
// hai, koi alag Unicode remapping nahi). Isliye Mangal ki
// tarah reverse-lookup table banane ki zaroorat nahi.
// ======================================================

import { isShiftedLabel } from "./physicalKey";

export interface NextKeyInfo {
  label: string;
  shift: boolean;
}

export function getNextKrutiKeyInfo(char: string | undefined): NextKeyInfo | null {
  if (!char) return null;
  const isShifted = isShiftedLabel(char) || /[A-Z]/.test(char);
  return { label: char, shift: isShifted };
}