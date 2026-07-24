// ======================================================
// Physical Key Resolver
//
// Reads the PHYSICAL key position (KeyboardEvent.code)
// instead of the character the OS/browser decided to send
// (KeyboardEvent.key). This means typing works the same
// whether the visitor's system keyboard language is set to
// English, Hindi, or anything else — nobody needs to switch
// their OS input language to use this site.
//
// Also exports the raw code<->label tables so the virtual
// keyboard can be built from this SAME data instead of a
// separately hand-drawn picture — they can never drift apart.
// ======================================================

export const CODE_TO_BASE_KEY: Record<string, string> = {
  KeyA: "a", KeyB: "b", KeyC: "c", KeyD: "d", KeyE: "e",
  KeyF: "f", KeyG: "g", KeyH: "h", KeyI: "i", KeyJ: "j",
  KeyK: "k", KeyL: "l", KeyM: "m", KeyN: "n", KeyO: "o",
  KeyP: "p", KeyQ: "q", KeyR: "r", KeyS: "s", KeyT: "t",
  KeyU: "u", KeyV: "v", KeyW: "w", KeyX: "x", KeyY: "y",
  KeyZ: "z",
  Digit0: "0", Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4",
  Digit5: "5", Digit6: "6", Digit7: "7", Digit8: "8", Digit9: "9",
  Backquote: "`", Minus: "-", Equal: "=",
  BracketLeft: "[", BracketRight: "]", Backslash: "\\",
  Semicolon: ";", Quote: "'",
  Comma: ",", Period: ".", Slash: "/",
};

export const SHIFT_SYMBOL: Record<string, string> = {
  ",": "<", ".": ">", "/": "?",
  ";": ":", "'": '"',
  "[": "{", "]": "}", "\\": "|",
  "-": "_", "=": "+",
};

const SHIFT_SYMBOL_VALUES = new Set(Object.values(SHIFT_SYMBOL));

export function isShiftedLabel(label: string): boolean {
  return /^[A-Z]$/.test(label) || SHIFT_SYMBOL_VALUES.has(label);
}

export function getShiftedLabel(base: string): string {
  if (/^[a-z]$/.test(base)) return base.toUpperCase();
  return SHIFT_SYMBOL[base] ?? base;
}

// Returns the canonical key label used as an object key in our layout
// keymaps (e.g. "q", "Q", "[", "{") — or null if this physical key
// isn't one we care about (arrows, function keys, etc.).
export function resolvePhysicalKey(e: { code: string; shiftKey: boolean }): string | null {
  const base = CODE_TO_BASE_KEY[e.code];
  if (!base) return null;

  if (!e.shiftKey) return base;
  return getShiftedLabel(base);
}// Nukta letters (borrowed sounds) ek alag AltGr layer pe rehte hain,
// normal Inscript layout se separate. Aage aur nukta letters
// (क़, ख़, ग़, ज़, फ़, य़) chahiye ho toh yahin add kar dena.
export const NUKTA_KEYMAP: Record<string, string> = {
  "[": "ढ़",
};export function resolveAltGrKey(e: { code: string }): string | null {
  return CODE_TO_BASE_KEY[e.code] ?? null;
}