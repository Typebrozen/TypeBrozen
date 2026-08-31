// ======================================================
// Word Diff — result-report ke liye common logic
// ======================================================
// Live typing screen mein jo red/normal highlighting hoti hai,
// wahi exact logic yahan reuse hoti hai — taaki report PDF mein
// bhi bilkul wahi dikhe jo user ne screen par dekha tha, kisi
// bhi layout (InScript/GAIL/Krutidev) mein.
// ======================================================

import { toGraphemeSpans } from "./graphemes";
import { toKrutiSpans } from "./krutiSpans";

export interface DiffSegment {
  text: string;
  correct: boolean;
}

// mode: "mangal" | "gail" | "krutidev"
// targetWord: sahi word (jo type karna tha)
// typedWord: user ne asal mein kya type kiya (typedHistory se milta hai)
export function diffWord(targetWord: string, typedWord: string | null, mode: string): DiffSegment[] {
  if (typedWord === null) {
    // Ye word kabhi type hi nahi hua (agar exam beech mein khatam ho
    // gaya) — poora normal dikhao, "untouched" jaisa.
    return [{ text: targetWord, correct: true }];
  }

  const spans = mode === "krutidev" || mode === "gail" ? toKrutiSpans(targetWord) : toGraphemeSpans(targetWord);

  const segments: DiffSegment[] = spans.map((seg) => {
    const typedSlice = typedWord.slice(seg.start, seg.end);
    return { text: seg.text, correct: typedSlice === seg.text };
  });

  // Agar user ne extra characters type kar diye the (word se lamba),
  // wo bhi galat/red maan ke jodo — taaki report mein wo bhi dikhe.
  if (typedWord.length > targetWord.length) {
    segments.push({ text: typedWord.slice(targetWord.length), correct: false });
  }

  return segments;
}