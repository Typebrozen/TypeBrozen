// ======================================================
// Alt+Numpad Input Tracker (STEP 2)
// ======================================================
// Real Krutidev special characters are typed by holding Alt,
// pressing 4 digits on the PHYSICAL NUMPAD (leading zero
// included, e.g. Alt+0184), then releasing Alt. This class
// tracks that sequence across keydown/keyup events so the
// typing-test screen can resolve it to the right character.
//
// This file only tracks state — it doesn't touch the DOM or
// React. HindiTypingTest.jsx wires it into its existing
// keydown/keyup handlers (Step 2b, next).
// ======================================================

import { ALT_CODE_TO_CHAR } from "./krutidev-altcodes";

const NUMPAD_DIGIT_CODES: Record<string, string> = {
  Numpad0: "0", Numpad1: "1", Numpad2: "2", Numpad3: "3", Numpad4: "4",
  Numpad5: "5", Numpad6: "6", Numpad7: "7", Numpad8: "8", Numpad9: "9",
};

export class AltNumpadInput {
  private buffer = "";
  private active = false;

  /**
   * Call this from the keydown handler BEFORE any other key
   * processing, whenever mode === "krutidev".
   * Returns true if this keydown was consumed as part of an
   * alt-numpad sequence (caller should preventDefault and stop —
   * do NOT treat it as a normal typed character).
   */
  handleKeyDown(e: { altKey: boolean; code: string }): boolean {
    if (!e.altKey) {
      this.reset();
      return false;
    }
    const digit = NUMPAD_DIGIT_CODES[e.code];
    if (digit === undefined) {
      // Alt is held but this isn't a numpad digit (e.g. Alt+Tab) —
      // not our sequence, let the browser/OS handle it normally.
      return false;
    }
    this.active = true;
    this.buffer += digit;
    if (this.buffer.length > 4) this.buffer = this.buffer.slice(-4);
    return true;
  }

  /**
   * Call this from the keyup handler when the released key is Alt
   * itself (e.key === "Alt"). Returns the resolved character, or
   * null if no valid sequence was in progress / code not found.
   */
  handleAltRelease(): string | null {
    if (!this.active) return null;
    const code = parseInt(this.buffer, 10);
    this.reset();
    if (Number.isNaN(code)) return null;
    return ALT_CODE_TO_CHAR[code] ?? null;
  }

  private reset() {
    this.buffer = "";
    this.active = false;
  }
}