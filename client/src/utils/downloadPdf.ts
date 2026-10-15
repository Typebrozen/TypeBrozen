// ======================================================
// PDF Download — branded, vector-text result report
// ======================================================
// Teeno Hindi layouts (InScript / GAIL / Krutidev) ka result ek
// hi tareeke se banta hai. Background mein:
//
//   1. Har word ko "akshar" cells mein toda jata hai — wahi
//      boundaries jo live typing screen use karti hai
//      (Krutidev/GAIL: toKrutiSpans, InScript: toGraphemeSpans).
//   2. InScript ke Unicode cells ko uni2kru() se Kruti-Dev mein
//      badla jata hai, taaki PDF mein hamesha KrutiDev font hi
//      chale (jsPDF Devanagari shaping nahi jaanta, Kruti Dev mein
//      har glyph independent hota hai).
//   3. SAFETY NET: agar kisi word ke akshar-wise conversion ka jod
//      poore word ke conversion se na mile, to wo word todte nahi —
//      poora ek hi rang mein (sahi = kala, galat = laal) dikhta hai.
//   4. Cells ko same-rang ki runs mein jodkar ek saath draw kiya
//      jata hai. Sahi word = ek hi text call (bilkul purane jaisa).
//   5. Word kabhi beech se line/page mein nahi tootta.
//
// User ko in sab ka pata nahi chalta: usko bas result dikhta hai.
// ======================================================

import jsPDF from "jspdf";
import { KRUTIDEV_BASE64 } from "./krutiDevFont";
import { uni2kru } from "../engine/uni2kru";
import { toGraphemeSpans } from "../engine/graphemes";
import { toKrutiSpans } from "../engine/krutiSpans";

type RGB = [number, number, number];

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_LIMIT = PAGE_HEIGHT - MARGIN - 12; // is se neeche text nahi jayega

const COLOR_OK: RGB = [30, 30, 30];
const COLOR_BAD: RGB = [220, 38, 38];

const WRONG_LIST_MAX = 60; // "galat shabdon ki soochi" mein zyada se zyada itne

function registerFonts(pdf: jsPDF) {
  pdf.addFileToVFS("KrutiDev010.ttf", KRUTIDEV_BASE64);
  pdf.addFont("KrutiDev010.ttf", "KrutiDev010", "normal");
}

// Hindi (Unicode) label ko Kruti-Dev text banata hai — static labels ke liye.
// NOTE: labels mein "-" ya brackets mat rakhna, Kruti font mein unka glyph alag hota hai.
function k(hindiUnicode: string): string {
  return uni2kru(hindiUnicode);
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

// ── Word -> akshar cells ──
interface Cell {
  kru: string; // PDF mein jo Kruti-Dev text draw hoga
  bad: boolean;
}

function isKrutiMode(mode: string): boolean {
  return mode === "krutidev" || mode === "gail";
}

function buildCells(
  word: string,
  typed: string | null,
  result: null | "correct" | "incorrect",
  mode: string
): Cell[] {
  const kruti = isKrutiMode(mode);
  const wrong = result === "incorrect";
  const typedStr = typed ?? "";
  const spans = kruti ? toKrutiSpans(word) : toGraphemeSpans(word);

  const cells: Cell[] = spans.map((sp) => {
    // Live screen jaisa hi rule: akshar tabhi "judged" hai jab uske sab
    // keystrokes type ho chuke hon; jo type hi nahi hua wo bhi galat hai.
    const judged = typedStr.length >= sp.end;
    const bad = wrong && (!judged || typedStr.slice(sp.start, sp.end) !== sp.text);
    return { kru: kruti ? sp.text : uni2kru(sp.text), bad };
  });

  if (!kruti) {
    // SAFETY NET — akshar-wise conversion ka jod poore word jaisa na ho
    // to word ko todna band: poora ek rang mein.
    const whole = uni2kru(word);
    if (cells.map((c) => c.kru).join("") !== whole) {
      return [{ kru: whole, bad: wrong }];
    }
  }

  // Word galat hai par har akshar sahi (sirf extra keys dabe) — kam se kam
  // ek jagah laal dikhao taaki reader ko pata chale.
  if (wrong && cells.length > 0 && !cells.some((c) => c.bad)) {
    cells[cells.length - 1].bad = true;
  }
  return cells;
}

interface Run {
  text: string;
  bad: boolean;
}

// Lagatar same-rang wale cells ko ek run mein jodna.
function toRuns(cells: Cell[]): Run[] {
  const runs: Run[] = [];
  for (const c of cells) {
    const last = runs[runs.length - 1];
    if (last && last.bad === c.bad) last.text += c.kru;
    else runs.push({ text: c.kru, bad: c.bad });
  }
  return runs;
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
  pdf.text(new Date().toLocaleDateString("en-GB"), PAGE_WIDTH - MARGIN, 22, { align: "right" });

  return bandHeight + 14;
}

function skillLabel(wpm: number): { label: string; color: RGB } {
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

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(130, 130, 130);
  pdf.text("NET WPM", PAGE_WIDTH / 2, startY + 6, { align: "center" });

  pdf.setFont("KrutiDev010", "normal");
  pdf.setFontSize(9);
  pdf.text(k("आपकी असली स्पीड"), PAGE_WIDTH / 2, startY + 11, { align: "center" });

  const badgeY = startY + 15;
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
  const bands: { label: string; upto: number; color: RGB }[] = [
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

  const clampedWpm = Math.max(0, Math.min(netWpm, 100));
  const markerX = gaugeX + (clampedWpm / 100) * gaugeWidth;
  pdf.setFillColor(20, 20, 20);
  pdf.triangle(markerX - 2, gaugeY - 3, markerX + 2, gaugeY - 3, markerX, gaugeY, "F");

  return gaugeY + 16;
}

function drawStatsRow(pdf: jsPDF, stats: PdfReportStats, startY: number): number {
  const boxes: { label: string; value: string | number; color: RGB }[] = [
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

// Har page ke neeche footer + page number (sabse end mein, jab total pages pata ho).
function drawFooters(pdf: jsPDF) {
  const total = pdf.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    pdf.setPage(p);
    pdf.setDrawColor(230, 230, 230);
    pdf.line(MARGIN, PAGE_HEIGHT - 14, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 14);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(160, 160, 160);
    pdf.text(
      "Yeh score practice ke liye hai — exact threshold apni exam ki official notification mein check karein.",
      MARGIN,
      PAGE_HEIGHT - 9
    );
    pdf.text(`typehanuman.com  |  ${p}/${total}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 9, { align: "right" });
  }
}

export function downloadResultPdf(data: PdfReportData): void {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  registerFonts(pdf);
  const kruti = isKrutiMode(data.mode);

  let cursorY = drawHeader(pdf, data.meta);
  cursorY = drawSpeedSection(pdf, data.stats.netWpm, cursorY + 10);
  cursorY = drawStatsRow(pdf, data.stats, cursorY);

  // ── Section heading ──
  pdf.setFont("KrutiDev010", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(40, 40, 40);
  const headingText = k("शब्द दर शब्द विवरण");
  pdf.text(headingText, MARGIN, cursorY);
  const headingWidth = pdf.getTextWidth(headingText);

  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(k("गलत शब्द लाल रंग में दिखाए गए हैं"), MARGIN + headingWidth + 3, cursorY);
  cursorY += 8;

  // ── Passage box (multi-page safe: har page ka apna box) ──
  const fontSize = 12.5;
  const lineHeight = 8;
  const spaceWidth = 2.2;
  const textLeft = MARGIN + 4;
  const textRight = PAGE_WIDTH - MARGIN - 4;

  let boxTop = cursorY;
  cursorY += 6;
  let cursorX = textLeft;

  const closeBox = (bottom: number) => {
    pdf.setDrawColor(225, 225, 225);
    pdf.roundedRect(MARGIN, boxTop, CONTENT_WIDTH, Math.max(bottom - boxTop, 4), 2, 2, "S");
  };
  const startNewPage = () => {
    closeBox(BOTTOM_LIMIT + 4);
    pdf.addPage();
    boxTop = MARGIN;
    cursorY = MARGIN + 8;
    cursorX = textLeft;
  };
  const nextLine = () => {
    cursorX = textLeft;
    cursorY += lineHeight;
    if (cursorY > BOTTOM_LIMIT) startNewPage();
  };

  pdf.setFont("KrutiDev010", "normal");
  pdf.setFontSize(fontSize);

  const wrongList: { expected: string; typed: string | null }[] = [];

  data.words.forEach((word, idx) => {
    const result = data.wordResults[idx] ?? null;
    const typed = data.typedHistory[idx] ?? null;

    const cells = buildCells(word, typed, result, data.mode);
    const runs = toRuns(cells);
    const widths = runs.map((r) => pdf.getTextWidth(r.text));
    const wordWidth = widths.reduce((a, b) => a + b, 0);

    // Word kabhi beech se nahi tootega: poora na aaye to naye line par.
    if (cursorX + wordWidth > textRight && cursorX > textLeft) nextLine();

    let x = cursorX;
    runs.forEach((run, i) => {
      const c = run.bad ? COLOR_BAD : COLOR_OK;
      pdf.setTextColor(c[0], c[1], c[2]);
      pdf.text(run.text, x, cursorY);
      x += widths[i];
    });
    cursorX = x + spaceWidth;

    if (result === "incorrect") {
      wrongList.push({
        expected: kruti ? word : uni2kru(word),
        typed: typed && typed.length > 0 ? (kruti ? typed : uni2kru(typed)) : null,
      });
    }
  });

  const boxBottom = cursorY + lineHeight - 2;
  closeBox(boxBottom);
  cursorY = boxBottom;

  // ── Galat shabdon ki soochi: sahi word -> aapne kya type kiya ──
  if (wrongList.length > 0) {
    cursorY += 12;
    if (cursorY > BOTTOM_LIMIT - 20) {
      pdf.addPage();
      cursorY = MARGIN + 8;
    }

    pdf.setFont("KrutiDev010", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(40, 40, 40);
    const listHeading = k("गलत शब्दों की सूची");
    pdf.text(listHeading, MARGIN, cursorY);
    const lhw = pdf.getTextWidth(listHeading);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(k("सही शब्द और आपने जो लिखा"), MARGIN + lhw + 3, cursorY);
    cursorY += 9;

    const colW = CONTENT_WIDTH / 2;
    const rowH = 9;
    const shown = wrongList.slice(0, WRONG_LIST_MAX);

    shown.forEach((item, i) => {
      const col = i % 2;
      if (col === 0) {
        if (i > 0) cursorY += rowH;
        if (cursorY > BOTTOM_LIMIT) {
          pdf.addPage();
          cursorY = MARGIN + 8;
        }
      }
      const x0 = MARGIN + col * colW + 2;

      pdf.setFont("KrutiDev010", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(COLOR_OK[0], COLOR_OK[1], COLOR_OK[2]);
      pdf.text(item.expected, x0, cursorY);
      const w1 = pdf.getTextWidth(item.expected);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text("->", x0 + w1 + 2, cursorY);
      const arrowW = pdf.getTextWidth("->");
      const x2 = x0 + w1 + 2 + arrowW + 2;

      if (item.typed) {
        pdf.setFont("KrutiDev010", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(COLOR_BAD[0], COLOR_BAD[1], COLOR_BAD[2]);
        pdf.text(item.typed, x2, cursorY);
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(150, 150, 150);
        pdf.text("(blank)", x2, cursorY);
      }
    });

    if (wrongList.length > WRONG_LIST_MAX) {
      cursorY += rowH + 2;
      if (cursorY > BOTTOM_LIMIT) {
        pdf.addPage();
        cursorY = MARGIN + 8;
      }
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`+ ${wrongList.length - WRONG_LIST_MAX} more wrong words not listed`, MARGIN + 2, cursorY);
    }
  }

  drawFooters(pdf);
  pdf.save(data.filename);
}