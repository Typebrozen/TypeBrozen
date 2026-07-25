import { isShiftedLabel } from "./physicalKey";
import { KRUTI_EXTENDED_KEYMAP } from "../layouts/krutidev-extended";

export interface NextKeyInfo {
  label: string;
  shift: boolean;
  altGr?: boolean;
}

const CHAR_TO_EXTENDED_LABEL: Record<string, string> = {};
for (const [label, char] of Object.entries(KRUTI_EXTENDED_KEYMAP)) {
  CHAR_TO_EXTENDED_LABEL[char] = label;
}

export function getNextKrutiKeyInfo(char: string | undefined): NextKeyInfo | null {
  if (!char) return null;

  const extendedLabel = CHAR_TO_EXTENDED_LABEL[char];
  if (extendedLabel) {
    return { label: extendedLabel, shift: false, altGr: true };
  }

  const isShifted = isShiftedLabel(char) || /[A-Z]/.test(char);
  return { label: char, shift: isShifted };
}