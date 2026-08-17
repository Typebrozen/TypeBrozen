// ======================================================
// Krutidev Alt+Numpad Code Table (STEP 1)
// ======================================================
// Real Krutidev software does NOT use "AltGr + single letter"
// for its special characters — it uses the Windows generic
// "Alt + 4-digit numpad code" mechanism (hold Alt, type the
// digits on the RIGHT-SIDE NUMPAD, release Alt). This table is
// the source of truth for that, so Step 2 (input handling) and
// Step 3 (on-screen hints) can both be built from it.
//
// Every entry below was extracted directly from our own
// authoritative kru2uni.ts mapping table (so it's guaranteed to
// match what the converter actually produces/expects), then
// cross-checked against the publicly published Krutidev
// alt-code chart — all 46 matched exactly except two (‚ and ™),
// which needed the Windows CP1252 special-range code instead of
// the raw Unicode code point (documented inline below).
//
// altCode: the number to type on the numpad after holding Alt
//          (e.g. 184 means the user presses Alt + 0 1 8 4).
//          Windows always needs a leading 0 for these, so the
//          UI should display it as "Alt+0184".
// represents: what this Krutidev character stands for once the
//          Krutidev font renders it — for reference/debugging
//          only, not needed at runtime.
// ======================================================

export interface KrutiAltCodeEntry {
    char: string;
    altCode: number;
    represents: string; // human-readable note, not used programmatically
  }
  
  export const KRUTI_ALT_CODES: KrutiAltCodeEntry[] = [
    { char: '\u00a1', altCode: 161, represents: 'ँ (chandrabindu)' },
    { char: '\u00a5', altCode: 165, represents: 'ञ' },
    { char: '\u00aa', altCode: 170, represents: '्र (subscript-ra)' },
    { char: '\u00ab', altCode: 171, represents: 'त्र् (halant form)' },
    { char: '\u00b3', altCode: 179, represents: 'ङ' },
    { char: '\u00b6', altCode: 182, represents: 'फ् (halant)' },
    { char: '\u00b8', altCode: 184, represents: 'य् (halant)' },
    { char: '\u00ba', altCode: 186, represents: 'ह् (halant)' },
    { char: '\u00c1', altCode: 193, represents: 'प्र (ligature, alt form)' },
    { char: '\u00c3', altCode: 195, represents: 'ई' },
    { char: '\u00c4', altCode: 196, represents: 'घ' },
    { char: '\u00c5', altCode: 197, represents: 'ऊ' },
    { char: '\u00c8', altCode: 200, represents: 'ीं (matra+anuswar)' },
    { char: '\u00cb', altCode: 203, represents: 'ध् (halant, alt form)' },
    { char: '\u00cc', altCode: 204, represents: 'द्द' },
    { char: '\u00cd', altCode: 205, represents: 'ट्ट' },
    { char: '\u00ce', altCode: 206, represents: 'ट्ठ' },
    { char: '\u00cf', altCode: 207, represents: 'ड्ड' },
    { char: '\u00d1', altCode: 209, represents: 'कृ' },
    { char: '\u00d2', altCode: 210, represents: 'भ (alt form)' },
    { char: '\u00d3', altCode: 211, represents: '्य (subscript-ya)' },
    { char: '\u00d4', altCode: 212, represents: 'ड्ढ' },
    { char: '\u00d6', altCode: 214, represents: 'झ् (halant, alt form)' },
    { char: '\u00d8', altCode: 216, represents: 'क्र' },
    { char: '\u00d9', altCode: 217, represents: 'त्त् (halant form)' },
    { char: '\u00dc', altCode: 220, represents: 'श् (halant, alt form)' },
    { char: '\u00dd', altCode: 221, represents: 'फ्र' },
    { char: '\u00e0', altCode: 224, represents: 'ह्न' },
    { char: '\u00e1', altCode: 225, represents: 'ह्य' },
    { char: '\u00e2', altCode: 226, represents: 'हृ' },
    { char: '\u00e3', altCode: 227, represents: 'ह्म' },
    { char: '\u00e4', altCode: 228, represents: 'क्त' },
    { char: '\u00e6', altCode: 230, represents: 'द्र' },
    { char: '\u00e7', altCode: 231, represents: 'प्र' },
    { char: '\u00e8', altCode: 232, represents: 'ध (alt form)' },
    { char: '\u00e9', altCode: 233, represents: 'न्न' },
    { char: '\u00ea', altCode: 234, represents: 'ट्ट (alt form)' },
    { char: '\u00eb', altCode: 235, represents: 'ट्ठ (alt form)' },
    { char: '\u00ec', altCode: 236, represents: 'ड्ड (alt form)' },
    { char: '\u00ed', altCode: 237, represents: 'द्द (alt form)' },
    { char: '\u00ef', altCode: 239, represents: 'ड्ढ (alt form)' },
    { char: '\u00f1', altCode: 241, represents: '॰ (abbreviation sign)' },
    { char: '\u00f4', altCode: 244, represents: 'क्क' },
    { char: '\u00f7', altCode: 247, represents: 'झ्' },
    // The two CP1252-special-range exceptions: their Windows Alt
    // code is NOT their raw Unicode code point — Alt+0128..0159
    // types through the Windows-1252 codepage, not literal Unicode.
    { char: '\u201a', altCode: 130, represents: 'ऑ-type vowel sign' },
    { char: '\u2122', altCode: 153, represents: 'न्न् (halant form)' },
  ];
  
  // Fast lookup in both directions, ready for Step 2.
  export const CHAR_TO_ALT_CODE: Record<string, number> = {};
  export const ALT_CODE_TO_CHAR: Record<number, string> = {};
  for (const entry of KRUTI_ALT_CODES) {
    CHAR_TO_ALT_CODE[entry.char] = entry.altCode;
    ALT_CODE_TO_CHAR[entry.altCode] = entry.char;
  }