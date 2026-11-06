// ======================================================================
// Remington GAIL — Unicode typing engine (STEP 1: pure logic, no UI)
//
// Source of truth: SIL "Remington GAIL" keyboard (Keyman), which copies
// Webduniya's Hindi Indic Input 3 — the driver used on CPCT/SSC exam PCs.
// Every key directly produces Unicode (no Kruti Dev font, no converter).
//
// Labels used here are the SAME labels physicalKey.ts produces
// (resolvePhysicalKey): "d" = plain key, "D" = Shift+d, "{" = Shift+[ ...
//
// Main layer only (no AltGr/RAlt layer).  Digits = ASCII digits.
// ======================================================================

export const GAIL_KEYMAP: Record<string, string> = {
    // --- number row ---
    "`": "\u093c", "~": "\u0926\u094d\u092f",            // nukta | द्य
    "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
    "6": "6", "7": "7", "8": "8", "9": "9", "0": "0",
    "!": "\u0964", "@": "/", "#": "\u0903", "$": "*", "%": "-",   // । / ः * -
    "^": "\u2018", "&": "\u2019",                                 // ‘ ’
    "*": "\u0926\u094d\u0927", "(": "\u0924\u094d\u0930",         // द्ध त्र
    ")": "\u090b",                                                 // ऋ
    "-": ";", "_": ".", "=": "\u0943", "+": "\u094d",             // ; . ृ ्
    // --- QWERTY row ---
    q: "\u0941", Q: "\u092b", w: "\u0942", W: "\u0945",           // ु फ ू ॅ
    e: "\u092e", E: "\u092e\u094d", r: "\u0924", R: "\u0924\u094d",
    t: "\u091c", T: "\u091c\u094d", y: "\u0932", Y: "\u0932\u094d",
    u: "\u0928", U: "\u0928\u094d", i: "\u092a", I: "\u092a\u094d",
    o: "\u0935", O: "\u0935\u094d", p: "\u091a", P: "\u091a\u094d",
    "[": "\u0916\u094d", "{": "\u0915\u094d\u0937\u094d",         // ख् क्ष्
    "]": ",", "}": "\u0926\u094d\u0935",                           // , द्व
    "\\": "(", "|": ")",
    // --- home row ---
    a: "\u0902", A: "\u093e", s: "\u0947", S: "\u0948",           // ं ा े ै
    d: "\u0915", D: "\u0915\u094d", f: "\u093f", F: "\u0925\u094d",
    g: "\u0939", G: "\u0933", h: "\u0940", H: "\u092d\u094d",
    j: "\u0930", J: "\u0936\u094d\u0930", k: "\u093e", K: "\u091c\u094d\u091e",
    l: "\u0938", L: "\u0938\u094d", ";": "\u092f", ":": "\u0930\u0942",
    "'": "\u0936\u094d", '"': "\u0937\u094d",
    // --- bottom row ---
    z: "\u094d\u0930", Z: "\u0930\u094d",                         // ्र (after) | र् (before)
    x: "\u0917", X: "\u0917\u094d", c: "\u092c", C: "\u092c\u094d",
    v: "\u0905", V: "\u091f", b: "\u0907", B: "\u0920",
    n: "\u0926", N: "\u091b", m: "\u0909", M: "\u0921",
    ",": "\u090f", "<": "\u0922", ".": "\u0923\u094d", ">": "\u091d",
    "/": "\u0927\u094d", "?": "\u0918\u094d",
  };
  
  const HALANT = "\u094d";
  const NUKTA_FROM = [0x928,0x930,0x933,0x915,0x916,0x917,0x91c,0x921,0x922,0x92b,0x92f];
  const NUKTA_TO   = [0x929,0x931,0x934,0x958,0x959,0x95a,0x95b,0x95c,0x95d,0x95e,0x95f];
  
  // context rules: [last char of typed, key label, replacement of that last char]
  const CONTEXT_RULES: Array<[string, string, string]> = [
    ["\u0905", "k", "\u0906"], ["\u0905", "A", "\u0906"],     // अ+ा = आ
    ["\u0906", "W", "\u0911"],                                  // आ+ॅ = ऑ
    ["\u0906", "s", "\u0913"], ["\u0906", "S", "\u0914"],     // ओ औ
    ["\u0907", "Z", "\u0908"],                                  // ई
    ["\u0909", "q", "\u090a"],                                  // ऊ
    ["\u090f", "W", "\u090d"], ["\u090f", "s", "\u0910"],     // ऍ ऐ
    ["\u093e", "W", "\u0949"],                                  // ॉ
    ["\u093e", "s", "\u094b"], ["\u093e", "S", "\u094c"],     // ो ौ
    ["\u0945", "a", "\u0901"], ["\u0945", "A", "\u0901"],     // ँ
    ["\u0902", "W", "\u0901"],
    ["\u0964", "!", "\u0965"],                                  // ॥
    ["\u0943", "=", "\u0944"],                                  // ॄ
    ["\u2018", "^", "\u201c"], ["\u2019", "&", "\u201d"],     // “ ”
  ];
  
  /** Apply ONE key press to the typed text, exactly like the real driver. */
  export function gailApply(typed: string, label: string): string {
    const out = GAIL_KEYMAP[label];
    if (out === undefined) return typed;
  
    // letter + halant + (k | A)  ->  letter (full form)       e.g. ख् + k = ख
    if ((label === "k" || label === "A") && typed.endsWith(HALANT)) {
      const prev = typed.charCodeAt(typed.length - 2);
      if (prev >= 0x904 && prev <= 0x939) return typed.slice(0, -1);
    }
    // consonant + nukta key -> precomposed nukta letter       e.g. ड + ` = ड़
    if (label === "`" && typed.length > 0) {
      const i = NUKTA_FROM.indexOf(typed.charCodeAt(typed.length - 1));
      if (i >= 0) return typed.slice(0, -1) + String.fromCharCode(NUKTA_TO[i]);
    }
    if (typed.length > 0) {
      const last = typed[typed.length - 1];
      for (const [ctx, key, rep] of CONTEXT_RULES) {
        if (last === ctx && key === label) {
          // special: ॉ + ं-chandrabindu rule not needed in main layer
          return typed.slice(0, -1) + rep;
        }
      }
    }
    return typed + out;
  }
  
  const norm = (s: string) => s.normalize("NFC");
  
  function isViable(state: string, target: string): boolean {
    const n = norm(state);
    if (target.startsWith(n)) return true;
    // the LAST typed character may still be "pending": a later key can merge
    // into it (half-letter + k -> full letter, अ + k -> आ, ा + s -> ो, ...)
    return n.length > 0 && target.startsWith(n.slice(0, -1));
  }
  
  // 'k' is preferred over 'A' for ा (home-row key, what real typists use)
  const ALL_LABELS = ["k", ...Object.keys(GAIL_KEYMAP).filter((l) => l !== "k")];
  
  /**
   * Shortest key sequence that turns `typed` into `target`.
   * Returns [] if already equal, null if impossible with the main layer.
   */
  export function gailPlan(target: string, typed = ""): string[] | null {
    const T = norm(target);
    if (norm(typed) === T) return [];
    if (!isViable(typed, T)) return null;
    let frontier: Array<{ s: string; keys: string[] }> = [{ s: typed, keys: [] }];
    const seen = new Set<string>([typed]);
    for (let depth = 0; depth < 14 && frontier.length; depth++) {
      const next: typeof frontier = [];
      for (const { s, keys } of frontier) {
        for (const lab of ALL_LABELS) {
          const ns = gailApply(s, lab);
          if (ns === s || seen.has(ns) || !isViable(ns, T)) continue;
          seen.add(ns);
          const nk = [...keys, lab];
          if (norm(ns) === T) return nk;
          next.push({ s: ns, keys: nk });
        }
      }
      frontier = next;
    }
    return null;
  }
  
  /** True if what the user typed so far still can become `target`. */
  export function gailOnTrack(typed: string, target: string): boolean {
    return isViable(typed, norm(target));
  }