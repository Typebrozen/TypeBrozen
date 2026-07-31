export const EXAM_CONFIGS = {
    cpct: {
      label: "CPCT",
      fullName: "CPCT (MP Govt.)",
      durationSeconds: 15 * 60,
      backspaceAllowed: true,
      mode: "mangal",
      scoreMethod: "ssc",
    },
    ssc: {
      label: "SSC",
      fullName: "SSC CGL / CHSL / Stenographer",
      durationSeconds: 10 * 60,
      backspaceAllowed: false,
      mode: "mangal",
      scoreMethod: "ssc",
    },
    highcourt: {
      label: "High Court",
      fullName: "High Court Clerk / Copyist",
      durationSeconds: 10 * 60,
      backspaceAllowed: false,
      mode: "krutidev",
      scoreMethod: "ssc",
    },
    upsssc: {
      label: "UPSSSC / State LDC",
      fullName: "UPSSSC, RSMSSB & State LDC-DEO",
      durationSeconds: 10 * 60,
      backspaceAllowed: false,
      mode: "krutidev",
      scoreMethod: "rsmssb",
    },
  };