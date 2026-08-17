import { isShiftedLabel } from "./physicalKey";
import { CHAR_TO_ALT_CODE } from "./krutidev-altcodes";

export interface NextKeyInfo {
  label: string;
  shift: boolean;
  altCode?: number; // present when this character needs Alt+numpad, e.g. 184 means "Alt+0184"
}

export function getNextKrutiKeyInfo(char: string | undefined): NextKeyInfo | null {
  if (!char) return null;

  const altCode = CHAR_TO_ALT_CODE[char];
  if (altCode !== undefined) {
    return { label: char, shift: false, altCode };
  }

  const isShifted = isShiftedLabel(char) || /[A-Z]/.test(char);
  return { label: char, shift: isShifted };
}