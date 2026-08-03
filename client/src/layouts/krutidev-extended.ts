// Kuch Krutidev characters standard ASCII se bahar hote hain (jaise Å, ª)
// — ye kuch rare independent vowels ke liye use hote hain (jaise लखनऊ
// mein ऊ). Real Krutidev software mein ye special codes se aate hain;
// hum inhe apne engine mein ek free AltGr combo pe rakh rahe hain —
// bilkul waise hi jaise humne Mangal ke ढ़ letter ke liye kiya tha.
export const KRUTI_EXTENDED_KEYMAP: Record<string, string> = {
  u: "Å",
  y: "ª",
  i: "¡",
  c: "ç",
  k: "Ø",
};