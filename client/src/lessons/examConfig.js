// ======================================================
// Exam Configs
// ======================================================
// backspaceMode ke 4 possible values:
//   "full"              -> jitna chaho backspace karo (CPCT, BSSC)
//   "none"              -> bilkul allowed nahi (SSC, RRB NTPC)
//   "currentWordOnly"   -> sirf abhi wale word tak (RSMSSB)
//   "currentPlusOneWord"-> current + 1 pichla word tak (UPSSSC)
//
// layouts: array hai kyunki kai exams 1+ layout allow karte hain.
//   1 layout  -> exam select karte hi seedha chapter list khulegi
//   2+ layout -> pehle "layout choose karo" screen aayega
//
// contentCategories: contentBank.ts se kaunse paragraphs is exam
// ke liye dikhengi, category ke through.
// ======================================================

export const EXAM_CONFIGS = {
  cpct: {
    label: "CPCT",
    fullName: "CPCT (MP Govt.)",
    durationSeconds: 15 * 60,
    backspaceMode: "full",
    layouts: ["gail", "inscript"],
    contentCategories: ["general", "revenue"],
    scoreMethod: "ssc",
  },
  ssc: {
    label: "SSC",
    fullName: "SSC CGL / CHSL / Stenographer",
    durationSeconds: 10 * 60,
    backspaceMode: "none",
    layouts: ["krutidev", "inscript"],
    contentCategories: ["general"],
    scoreMethod: "ssc",
  },
  rrbntpc: {
    label: "RRB NTPC",
    fullName: "Railway RRB NTPC (Junior Clerk / Typist)",
    durationSeconds: 10 * 60,
    backspaceMode: "none",
    layouts: ["krutidev", "gail"],
    contentCategories: ["railway", "general"],
    scoreMethod: "ssc",
  },
  upsssc: {
    label: "UPSSSC",
    fullName: "UPSSSC Junior Assistant",
    durationSeconds: 5 * 60,
    backspaceMode: "currentPlusOneWord",
    layouts: ["krutidev", "inscript"],
    contentCategories: ["general", "revenue"],
    scoreMethod: "ssc",
  },
  rsmssb: {
    label: "RSMSSB",
    fullName: "RSMSSB Informatics Assistant (Rajasthan)",
    durationSeconds: 15 * 60,
    backspaceMode: "currentWordOnly",
    layouts: ["gail"],
    contentCategories: ["revenue", "general"],
    scoreMethod: "rsmssb",
  },
  bssc: {
    label: "BSSC",
    fullName: "BSSC Inter Level (Bihar)",
    durationSeconds: 10 * 60,
    backspaceMode: "full",
    layouts: ["inscript", "gail"],
    contentCategories: ["general", "revenue"],
    scoreMethod: "ssc",
  },
  highcourt: {
    label: "High Court",
    fullName: "High Court Clerk / Copyist",
    durationSeconds: 10 * 60,
    backspaceMode: "full",
    layouts: ["gail", "krutidev"],
    contentCategories: ["court", "general"],
    scoreMethod: "ssc",
  },
};