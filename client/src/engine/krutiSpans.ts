// ======================================================
// Krutidev Spans — Mangal ki graphemes.ts jaisi hi cheez,
// lekin Krutidev me koi Unicode combining marks nahi hote,
// har ASCII character apne aap ek independent render unit
// hai. Isliye yaha Intl.Segmenter ki zaroorat nahi.
// ======================================================

export interface KrutiSpan {
    text: string;
    start: number;
    end: number;
  }
  
  export function toKrutiSpans(text: string): KrutiSpan[] {
    return text.split("").map((ch, i) => ({ text: ch, start: i, end: i + 1 }));
  }