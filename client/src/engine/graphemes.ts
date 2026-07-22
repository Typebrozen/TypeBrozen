// ======================================================
// Grapheme Segmentation
// Splits Devanagari text into user-perceived characters —
// a consonant plus its matra counts as ONE unit. A matra
// must never end up alone in its own DOM node, or the
// browser's shaping engine draws it as a dotted circle.
// ======================================================

export interface GraphemeSpan {
    text: string;
    start: number; // raw char index where this cluster begins in the string
    end: number;   // raw char index where it ends (exclusive)
  }
  
  const DEVANAGARI_COMBINING =
    /[\u0900-\u0903\u093A\u093B\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963]/;
  
  // Plain array of cluster strings — used where we don't need position info.
  export function toGraphemes(text: string): string[] {
    return toGraphemeSpans(text).map((s) => s.text);
  }
  
  // Cluster strings WITH their raw-character start/end positions — used
  // wherever we need to know how many keystrokes a cluster takes, so we
  // can wait until it's fully typed before judging it right or wrong.
  export function toGraphemeSpans(text: string): GraphemeSpan[] {
    if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
      const seg = new (Intl as any).Segmenter("hi", { granularity: "grapheme" });
      const spans: GraphemeSpan[] = [];
      for (const s of seg.segment(text) as any) {
        spans.push({ text: s.segment, start: s.index, end: s.index + s.segment.length });
      }
      return spans;
    }
    return fallbackSegmentSpans(text);
  }
  
  // Manual fallback for the rare environment without Intl.Segmenter.
  function fallbackSegmentSpans(text: string): GraphemeSpan[] {
    const spans: GraphemeSpan[] = [];
    for (const ch of text) {
      const last = spans[spans.length - 1];
      if (last && DEVANAGARI_COMBINING.test(ch)) {
        last.text += ch;
        last.end += ch.length;
      } else {
        const start = last ? last.end : 0;
        spans.push({ text: ch, start, end: start + ch.length });
      }
    }
    return spans;
  }