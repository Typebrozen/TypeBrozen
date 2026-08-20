// ======================================================
// Content Resolver — category ke paragraphs ko sahi LAYOUT
// ke hisaab se resolve karta hai.
// ======================================================
// Content Bank mein sab kuch Unicode Hindi mein hai. Ye file
// wahi content leke, exam ke selected layout ke hisaab se
// display-ready text banati hai:
//   - "inscript" ya "gail" mode  -> Unicode text jaisa hai waisa
//   - "krutidev" mode            -> uni2kru() se convert karke
//
// Naya paragraph Content Bank mein add hote hi, ye function
// use automatically teeno layouts ke liye resolve kar dega —
// yahan kuch badalne ki zaroorat kabhi nahi padegi.
// ======================================================

import { CONTENT_BANK, ContentCategory, ContentEntry } from "./contentBank";
import { uni2kru } from "../engine/uni2kru";

export type ExamLayout = "inscript" | "gail" | "krutidev";

export interface ResolvedChapter {
  id: string;
  title: string;
  text: string; // display-ready — already sahi layout ke liye convert ho chuka
}

function toDisplayText(unicodeText: string, layout: ExamLayout): string {
  if (layout === "krutidev") {
    return uni2kru(unicodeText);
  }
  // inscript aur gail dono Unicode hi rakhte hain (GAIL mein bhi
  // target text Unicode hi hota hai — sirf raw keystrokes Kruti
  // Dev jaisi hoti hain, jo humne HindiTypingTest.jsx mein
  // pehle hi handle kar diya hai).
  return unicodeText;
}

// Har content entry ko ek chhota, readable title bhi chahiye
// chapter-list screen ke liye — pehle 4-5 shabdon se bana lete hain.
function titleFor(entry: ContentEntry): string {
  const firstWords = entry.text.split(/\s+/).slice(0, 5).join(" ");
  return firstWords + "...";
}

export function resolveChapters(
  categories: ContentCategory[],
  layout: ExamLayout
): ResolvedChapter[] {
  const matched = CONTENT_BANK.filter((entry) =>
    entry.categories.some((c) => categories.includes(c))
  );

  return matched.map((entry) => ({
    id: entry.id,
    title: titleFor(entry),
    text: toDisplayText(entry.text, layout),
  }));
}