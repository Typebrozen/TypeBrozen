// ======================================================
// Mangal Inscript Keymap — Physical key -> Unicode char
//
// Rebuilt to match Microsoft's official Devanagari - INSCRIPT
// keyboard driver (KBDINDEV.DLL) exactly, key by key — this is
// the real layout Windows ships and that real exam-center PCs
// use for Mangal/Unicode Hindi typing.
//
// Fixed vs. the previous version: the whole bottom row (Z X C V
// B N M) was shifted by one key compared to the real layout —
// ं (anuswar) was on X instead of X, स/ल/व/न/म/ण were all one
// key off, "/" (which should type य) was left as a literal
// slash, "]" and "\" were missing their base-layer characters
// (़ nukta sign and ॉ matra), J's shift was wrong (ड़ instead of
// ऱ), and the "=" key (ृ / ऋ — needed for words like कृष्ण) was
// missing entirely.
// ======================================================

export const MANGAL_KEYMAP = {
  q: "ौ", Q: "औ",
  w: "ै", W: "ऐ",
  e: "ा", E: "आ",
  r: "ी", R: "ई",
  t: "ू", T: "ऊ",
  y: "ब", Y: "भ",
  u: "ह", U: "ङ",
  i: "ग", I: "घ",
  o: "द", O: "ध",
  p: "ज", P: "झ",
  "[": "ड", "{": "ढ",
  "]": "़", "}": "ञ",
  "\\": "ॉ", "|": "ऑ",
  a: "ो", A: "ओ",
  s: "े", S: "ए",
  d: "्", D: "अ",
  f: "ि", F: "इ",
  g: "ु", G: "उ",
  h: "प", H: "फ",
  j: "र", J: "ऱ",
  k: "क", K: "ख",
  l: "त", L: "थ",
  ";": "च", ":": "छ",
  "'": "ट", '"': "ठ",
  z: "ॆ", Z: "ऎ",
  x: "ं", X: "ँ",
  c: "म", C: "ण",
  v: "न", V: "ऩ",
  b: "व", B: "ऴ",
  n: "ल", N: "ळ",
  m: "स", M: "श",
  ",": ",", "<": "ष",
  ".": ".", ">": "।",
  "/": "य", "?": "य़",
  "`": "ॊ", "~": "ऒ",
  "=": "ृ", "+": "ऋ",
  "-": "-", "_": "ः",
  // Base row: Devanagari digits (standard practical convention for
  // typing Hindi paragraphs with numbers — matches virtually every
  // real-world Inscript typing tutorial, even though the raw
  // Microsoft driver table itself puts these on a NumLock-state
  // column). Shift row: the official values (ऍ/ॅ are rare independent
  // vowels — included for completeness/authenticity even though
  // uncommon in normal paragraphs).
  "1": "१", "!": "ऍ",
  "2": "२", "@": "ॅ",
  "3": "३", "#": "्र",
  "4": "४", "$": "र्",
  "5": "५", "%": "ज्ञ",
  "6": "६", "^": "त्र",
  "7": "७", "&": "क्ष",
  "8": "८", "*": "श्र",
  "9": "९", "(": "(",
  "0": "०", ")": ")",
};

export const NUKTA_KEYMAP: Record<string, string> = {
  "[": "ढ़",
  h: "फ़",
  r: "ृ",
  z: "ज़",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  "0": "0",
};