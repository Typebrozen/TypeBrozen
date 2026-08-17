// Kuch Krutidev characters standard ASCII se bahar hote hain —
// rare independent vowels aur borrowed-sound letters ke liye.
// Real Krutidev software mein ye special codes se aate hain; hum
// inhe apne engine mein AltGr combos pe rakhte hain.
//
// NOTE: 7 naye entries add kiye gaye hain (y्,झ्,फ्,ङ,ञ,द्र,फ्र) —
// ye zaroori halant-forms/ligatures hain jo kru2uni/uni2kru.ts
// produce karte hain lekin pehle yahan reachable nahi the, isliye
// unhe use karne wale words (jaise "चन्द्र", "इन्द्र", "उपाध्याय")
// typing-target se hamesha skip ho rahe the. In AltGr key choices
// ka koi "official" Krutidev standard nahi hai (asli Krutidev
// software mein ye alag physical keys pe ho sakte hain) — agar
// aapke paas authentic Krutidev AltGr layout ka reference hai,
// to un keys se replace kar dijiye. Filhaal koi bhi free letter
// consistent rehne ke liye kaafi hai.
export const KRUTI_EXTENDED_KEYMAP: Record<string, string> = {
  u: "Å",
  y: "ª",
  i: "¡",
  c: "ç",
  k: "Ø",
  o: "‚",
  // newly added
  h: "¸", // य् (ya-halant)
  j: "÷", // झ् (jha-halant)
  f: "¶", // फ् (pha-halant)
  n: "³", // ङ (nga)
  m: "¥", // ञ (nya)
  d: "æ", // द्र (dra ligature)
  s: "Ý", // फ्र (phra ligature)
};