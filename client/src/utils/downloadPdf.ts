// ======================================================
// PDF Download — branded, vector-text result report
// ======================================================
// Passage ke saare words — chahe live-typing InScript mein hui
// ho, GAIL mein, ya Kruti Dev mein — PDF mein hamesha KrutiDev
// font se hi render hote hain. Wajah: Kruti Dev font ka har
// character independent hota hai (koi matra-reordering nahi
// chahiye), isliye jsPDF (jo Devanagari-shaping nahi jaanta)
// mein bhi kabhi nahi tootta — GAIL/Krutidev mein already yahi
// wajah se perfect kaam kar raha hai. InScript input ko is fix
// ke liye seedha uni2kru() se Kruti-Dev-raw mein convert kar
// dete hain — sirf PDF ke liye, live typing bilkul InScript hi
// rehti hai, user ko iska pata bhi nahi chalta.
// ======================================================

import jsPDF from "jspdf";
import { NOTO_DEVANAGARI_BASE64 } from "./devanagariFont";
import { KRUTIDEV_BASE64 } from "./krutiDevFont";
import { isWordCorrect } from "../engine/wordDiff";
import { uni2kru } from "../engine/uni2kru";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const CHHOTI_I = "\u093F";
const HALANT = "\u094D";

// Header/labels ke liye — ye chhote static phrases hain (koi user-typed
// content nahi), inmein "ि" kabhi nahi aata abhi, lekin future-safety
// ke liye reorder-guard rakha hai.
function reorderChhotiI(text: string): string {
  const chars = text.split("");
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === CHHOTI_I) {
      let j = i - 1;
      while (j > 0 && chars[j - 1] === HALANT) {
        j -= 2;
      }
      if (j < 0) j = 0;
      chars.splice(i, 1);
      chars.splice(j, 0, CHHOTI_I);
    }
  }
  return chars.join("");
}

function registerFonts(pdf: jsPDF) {
  pdf.addFileToVFS("NotoSansDevanagari.ttf", NOTO_DEVANAGARI_BASE64);
  pdf.addFont("NotoSansDevanagari.ttf", "NotoDevanagari", "normal");
  pdf.addFileToVFS("KrutiDev010.ttf", KRUTIDEV_BASE64);
  pdf.addFont("KrutiDev010.ttf", "KrutiDev010", "normal");
}

// Passage ke liye ab HAMESHA Kruti Dev font — mode kuch bhi ho.
function displayWordFor(word: string, mode: string): string {
  if (mode === "krutidev" || mode === "gail") {
    return word; // already raw Kruti-Dev-ASCII
  }
  return uni2kru(word); // InScript ka Unicode word -> Kruti-Dev-raw
}

export interface PdfReportStats {
  wpm: number;
  accuracy: number;
  grossWpm: number;
  netWpm: number;
  correctWords: number;
  incorrectWords: number;
}

export interface PdfReportData {
  title: string;
  meta: string;
  stats: PdfReportStats;
  words: string[];
  typedHistory: (string | null)[];
  wordResults: (null | "correct" | "incorrect")[];
  mode: string;
  filename: string;
}

// ── Header: dark band with TypeHanuman branding ──
function drawHeader(pdf: jsPDF, meta: string): number {
  const bandHeight = 26;
  pdf.setFillColor(10, 10, 10);
  pdf.rect(0, 0, PAGE_WIDTH, bandHeight, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Type", MARGIN, 16);
  const typeWidth = pdf.getTextWidth("Type");
  pdf.setTextColor(250, 204, 21);
  pdf.text("Hanuman", MARGIN + typeWidth, 16);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 200);
  pdf.text("Practice Report", MARGIN, 22);

  pdf.setFontSize(9);
  pdf.setTextColor(160, 160, 160);
  pdf.text(meta, PAGE_WIDTH - MARGIN, 16, { align: "right" });
  pdf.text(new Date().toLocaleDateString("hi-IN"), PAGE_WIDTH - MARGIN, 22, { align: "right" });

  return bandHeight + 14;
}

function skillLabel(wpm: number): { label: string; color: [number, number, number] } {
  if (wpm >= 80) return { label: "Pro", color: [22, 163, 74] };
  if (wpm >= 60) return { label: "Fast", color: [34, 197, 94] };
  if (wpm >= 40) return { label: "Fluent", color: [132, 204, 22] };
  if (wpm >= 20) return { label: "Average", color: [234, 179, 8] };
  return { label: "Slow", color: [156, 163, 175] };
}

function drawSpeedSection(pdf: jsPDF, netWpm: number, startY: number): number {
  const skill = skillLabel(netWpm);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(42);
  pdf.setTextColor(20, 20, 20);
  pdf.text(String(netWpm), PAGE_WIDTH / 2, startY, { align: "center" });

  pdf.setFont("NotoDevanagari", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(130, 130, 130);
  pdf.text(reorderChhotiI("NET WPM (आपकी असली स्पीड)"), PAGE_WIDTH / 2, startY + 6, { align: "center" });

  const badgeY = startY + 12;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  const badgeText = skill.label;
  const badgeTextWidth = pdf.getTextWidth(badgeText);
  const badgeW = badgeTextWidth + 10;
  const badgeX = PAGE_WIDTH / 2 - badgeW / 2;
  pdf.setFillColor(skill.color[0], skill.color[1], skill.color[2]);
  pdf.roundedRect(badgeX, badgeY, badgeW, 8, 4, 4, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.text(badgeText, PAGE_WIDTH / 2, badgeY + 5.5, { align: "center" });

  const gaugeY = badgeY + 15;
  const gaugeX = MARGIN + 20;
  const gaugeWidth = CONTENT_WIDTH - 40;
  const bands: { label: string; upto: number; color: [number, number, number] }[] = [
    { label: "Slow", upto: 20, color: [209, 213, 219] },
    { label: "Average", upto: 40, color: [253, 224, 71] },
    { label: "Fluent", upto: 60, color: [190, 242, 100] },
    { label: "Fast", upto: 80, color: [134, 239, 172] },
    { label: "Pro", upto: 100, color: [34, 197, 94] },
  ];
  let bx = gaugeX;
  const bandW = gaugeWidth / bands.length;
  bands.forEach((band) => {
    pdf.setFillColor(band.color[0], band.color[1], band.color[2]);
    pdf.rect(bx, gaugeY, bandW, 4, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.setTextColor(140, 140, 140);
    pdf.text(band.label, bx + bandW / 2, gaugeY + 8, { align: "center" });
    bx += bandW;
  });

  const clampedWpm = Math.min(netWpm, 100);
  const markerX = gaugeX + (clampedWpm / 100) * gaugeWidth;
  pdf.setFillColor(20, 20, 20);
  pdf.triangle(markerX - 2, gaugeY - 3, markerX + 2, gaugeY - 3, markerX, gaugeY, "F");

  return gaugeY + 16;
}

function drawStatsRow(pdf: jsPDF, stats: PdfReportStats, startY: number): number {
  const boxes: { label: string; value: string | number; color: [number, number, number] }[] = [
    { label: "Typing Speed", value: `${stats.wpm} WPM`, color: [20, 20, 20] },
    { label: "Accuracy", value: `${stats.accuracy}%`, color: [20, 20, 20] },
    { label: "Gross WPM", value: stats.grossWpm, color: [20, 20, 20] },
    { label: "Correct Words", value: stats.correctWords, color: [22, 163, 74] },
    { label: "Wrong Words", value: stats.incorrectWords, color: [220, 38, 38] },
  ];

  const gap = 3;
  const boxWidth = (CONTENT_WIDTH - gap * (boxes.length - 1)) / boxes.length;
  const boxHeight = 20;

  boxes.forEach((box, idx) => {
    const x = MARGIN + idx * (boxWidth + gap);

    pdf.setDrawColor(225, 225, 225);
    pdf.setFillColor(250, 250, 250);
    pdf.roundedRect(x, startY, boxWidth, boxHeight, 2, 2, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(box.color[0], box.color[1], box.color[2]);
    pdf.text(String(box.value), x + boxWidth / 2, startY + 10, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(130, 130, 130);
    pdf.text(box.label, x + boxWidth / 2, startY + 15.5, { align: "center" });
  });

  return startY + boxHeight + 12;
}

export function downloadResultPdf(data: PdfReportData): void {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  registerFonts(pdf);

  let cursorY = drawHeader(pdf, data.meta);
  cursorY = drawSpeedSection(pdf, data.stats.netWpm, cursorY + 10);
  cursorY = drawStatsRow(pdf, data.stats, cursorY);

  pdf.setFont("NotoDevanagari", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(40, 40, 40);
  const headingText = reorderChhotiI("शब्द-दर-शब्द विवरण");
  pdf.text(headingText, MARGIN, cursorY);
  const headingWidth = pdf.getTextWidth(headingText);

  pdf.setFont("NotoDevanagari", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(150, 150, 150);
  pdf.text(reorderChhotiI("(गलत शब्द लाल रंग में दिखाए गए हैं)"), MARGIN + headingWidth + 3, cursorY);
  cursorY += 8;

  const boxTopY = cursorY;
  cursorY += 6;

  const fontSize = 12.5;
  const lineHeight = 8;
  const spaceWidth = 2.2;

  // Passage ab hamesha KrutiDev010 font se — kisi bhi mode mein.
  pdf.setFont("KrutiDev010", "normal");
  pdf.setFontSize(fontSize);

  let cursorX = MARGIN + 4;

  data.words.forEach((word, idx) => {
    const correct = isWordCorrect(data.wordResults[idx]);
    const displayWord = displayWordFor(word, data.mode);
    const wordWidth = pdf.getTextWidth(displayWord);

    if (cursorY > PAGE_HEIGHT - MARGIN - 10) {
      pdf.addPage();
      cursorY = MARGIN + 10;
      cursorX = MARGIN + 4;
    }

    if (cursorX + wordWidth > PAGE_WIDTH - MARGIN - 4) {
      cursorX = MARGIN + 4;
      cursorY += lineHeight;
      if (cursorY > PAGE_HEIGHT - MARGIN - 10) {
        pdf.addPage();
        cursorY = MARGIN + 10;
      }
    }

    pdf.setTextColor(correct ? 30 : 220, correct ? 30 : 38, correct ? 30 : 38);
    pdf.text(displayWord, cursorX, cursorY);
    cursorX += wordWidth + spaceWidth;
  });

  const boxBottomY = cursorY + lineHeight - 2;

  pdf.setDrawColor(225, 225, 225);
  pdf.roundedRect(MARGIN, boxTopY, CONTENT_WIDTH, boxBottomY - boxTopY, 2, 2, "S");

  pdf.setDrawColor(230, 230, 230);
  pdf.line(MARGIN, PAGE_HEIGHT - 14, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 14);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(160, 160, 160);
  pdf.text("Yeh score practice ke liye hai — exact threshold apni exam ki official notification mein check karein.", MARGIN, PAGE_HEIGHT - 9);
  pdf.text("typehanuman.com", PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 9, { align: "right" });

  pdf.save(data.filename);
}