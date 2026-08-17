import { CODE_TO_BASE_KEY, getShiftedLabel } from "../engine/physicalKey";
import { MANGAL_KEYMAP, NUKTA_KEYMAP } from "../layouts/mangal-keymap";

const UNIT = 42;
const GAP = 6;

const ROW_1 = [
  { code: "Backquote", u: 1 }, { code: "Digit1", u: 1 }, { code: "Digit2", u: 1 },
  { code: "Digit3", u: 1 }, { code: "Digit4", u: 1 }, { code: "Digit5", u: 1 },
  { code: "Digit6", u: 1 }, { code: "Digit7", u: 1 }, { code: "Digit8", u: 1 },
  { code: "Digit9", u: 1 }, { code: "Digit0", u: 1 }, { code: "Minus", u: 1 },
  { code: "Equal", u: 1 }, { code: "Backspace", u: 2 },
];

const ROW_2 = [
  { code: "Tab", u: 1.5 }, { code: "KeyQ", u: 1 }, { code: "KeyW", u: 1 },
  { code: "KeyE", u: 1 }, { code: "KeyR", u: 1 }, { code: "KeyT", u: 1 },
  { code: "KeyY", u: 1 }, { code: "KeyU", u: 1 }, { code: "KeyI", u: 1 },
  { code: "KeyO", u: 1 }, { code: "KeyP", u: 1 }, { code: "BracketLeft", u: 1 },
  { code: "BracketRight", u: 1 }, { code: "Backslash", u: 1.5 },
];

const ROW_3 = [
  { code: "CapsLock", u: 1.75 }, { code: "KeyA", u: 1 }, { code: "KeyS", u: 1 },
  { code: "KeyD", u: 1 }, { code: "KeyF", u: 1 }, { code: "KeyG", u: 1 },
  { code: "KeyH", u: 1 }, { code: "KeyJ", u: 1 }, { code: "KeyK", u: 1 },
  { code: "KeyL", u: 1 }, { code: "Semicolon", u: 1 }, { code: "Quote", u: 1 },
  { code: "Enter", u: 2.25 },
];

const ROW_4 = [
  { code: "ShiftLeft", u: 2.25 }, { code: "KeyZ", u: 1 }, { code: "KeyX", u: 1 },
  { code: "KeyC", u: 1 }, { code: "KeyV", u: 1 }, { code: "KeyB", u: 1 },
  { code: "KeyN", u: 1 }, { code: "KeyM", u: 1 }, { code: "Comma", u: 1 },
  { code: "Period", u: 1 }, { code: "Slash", u: 1 }, { code: "ShiftRight", u: 2.75 },
];

const ROW_5 = [
  { code: "ControlLeft", u: 1.25 }, { code: "AltLeft", u: 1.25 },
  { code: "Space", u: 6.25 },
  { code: "AltRight", u: 1.25 }, { code: "ControlRight", u: 1.25 },
];

const ROWS = [ROW_1, ROW_2, ROW_3, ROW_4, ROW_5];

const FUNCTION_KEYS = new Set([
  "Backspace", "Tab", "CapsLock", "Enter", "ShiftLeft", "ShiftRight",
  "ControlLeft", "ControlRight", "AltLeft", "AltRight", "Space",
]);

const FUNCTION_LABELS = {
  Backspace: "⌫",
  Tab: "Tab",
  CapsLock: "Caps",
  Enter: "Enter",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  ControlLeft: "Ctrl",
  ControlRight: "Ctrl",
  AltLeft: "Alt",
  AltRight: "Alt",
};

function widthPx(u) {
  return u * UNIT + (u - 1) * GAP;
}

// mode: "mangal" | "krutidev"
export default function VirtualKeyboard({ nextKey, mode = "mangal" }) {
  const glyphFontFamily =
    mode === "krutidev" ? "'Kruti Dev 010', sans-serif" : "'Noto Sans Devanagari', 'Mangal', sans-serif";

  function glyphFor(label) {
    if (mode === "krutidev") return label;
    return MANGAL_KEYMAP[label] ?? "";
  }

  // Krutidev special characters (Alt+numpad) don't correspond to any
  // single letter key on this layout anymore, so we highlight both Alt
  // keys generically and show the exact digit sequence above the board.
  const showAltCodeBanner = mode === "krutidev" && nextKey?.altCode !== undefined;
  const altCodeSequence = showAltCodeBanner ? "0" + nextKey.altCode : null;

  return (
    <div className="rounded-2xl p-5 border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 overflow-x-hidden">
      <div className="flex flex-col gap-1.5 items-center">
        {ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1.5">
            {row.map((k) => {
              const { code, u } = k;
              const width = widthPx(u);

              if (FUNCTION_KEYS.has(code)) {
                const isShiftHighlight =
                  nextKey?.shift && !nextKey?.altGr && (code === "ShiftLeft" || code === "ShiftRight");
                // Mangal nukta guidance highlights Right Alt (real AltGr key).
                const isAltGrHighlight = mode === "mangal" && nextKey?.altGr && code === "AltRight";
                // Krutidev Alt+numpad guidance highlights BOTH Alt keys,
                // since there's no fixed side and no numpad drawn here.
                const isAltCodeHighlight =
                  showAltCodeBanner && (code === "AltLeft" || code === "AltRight");
                const isSpaceHighlight = code === "Space" && nextKey?.label === " ";
                const active = isShiftHighlight || isAltGrHighlight || isAltCodeHighlight || isSpaceHighlight;

                return (
                  <div
                    key={code}
                    style={{ width, height: 46 }}
                    className={[
                      "flex items-center justify-center rounded-lg text-[11px] font-medium select-none",
                      "border-b-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-100",
                      active
                        ? "bg-gradient-to-b from-blue-400 to-blue-600 border-blue-700 text-white shadow-[0_0_14px_rgba(59,130,246,0.8)]"
                        : "bg-gradient-to-b from-zinc-700 to-zinc-800 border-zinc-950 text-zinc-300",
                    ].join(" ")}
                  >
                    {code === "Space" ? (isSpaceHighlight ? "अगला शब्द" : "") : FUNCTION_LABELS[code]}
                  </div>
                );
              }

              const base = CODE_TO_BASE_KEY[code];
              const shiftLabel = getShiftedLabel(base);
              const baseGlyph = glyphFor(base);
              const shiftGlyph = glyphFor(shiftLabel);
              // Nukta lookup only applies to Mangal mode now — Krutidev's
              // special characters go through Alt+numpad, not a per-letter
              // AltGr map, so there's nothing to show here for it anymore.
              const nuktaGlyph = mode === "mangal" ? NUKTA_KEYMAP[base] : null;

              const isActiveBase =
                nextKey && !nextKey.shift && !nextKey.altGr && nextKey.altCode === undefined && nextKey.label === base;
              const isActiveShift =
                nextKey && nextKey.shift && !nextKey.altGr && nextKey.label === shiftLabel;
              const isActiveAltGr = mode === "mangal" && nextKey && nextKey.altGr && nextKey.label === base;
              const active = isActiveBase || isActiveShift || isActiveAltGr;

              return (
                <div
                  key={code}
                  style={{ width, height: 46 }}
                  className={[
                    "flex flex-col items-center justify-center rounded-lg leading-tight select-none",
                    "border-b-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-100",
                    active
                      ? "bg-gradient-to-b from-blue-400 to-blue-600 border-blue-700 text-white shadow-[0_0_14px_rgba(59,130,246,0.85)] scale-[1.05]"
                      : "bg-gradient-to-b from-zinc-800 to-zinc-900 border-zinc-950 text-zinc-200",
                  ].join(" ")}
                >
                  {/* Jo letter is waqt ACTUALLY type karni hai, wahi bada/bold
                      dikhta hai — chahe wo shift wala ho ya normal wala.
                      Baaki chhota/faded rehta hai, taaki confusion na ho. */}
                  <span
                    style={{
                      fontSize: isActiveShift ? 15 : 9,
                      fontWeight: isActiveShift ? "bold" : "normal",
                      opacity: isActiveAltGr ? 0.1 : isActiveShift ? 1 : 0.55,
                      fontFamily: glyphFontFamily,
                    }}
                  >
                    {shiftGlyph}
                  </span>
                  <span
                    style={{
                      fontSize: isActiveShift ? 9 : 15,
                      fontWeight: isActiveBase ? "bold" : "normal",
                      opacity: isActiveShift ? 0.4 : 1,
                      fontFamily: glyphFontFamily,
                    }}
                  >
                    {baseGlyph}
                  </span>
                  {nuktaGlyph && (
                    <span
                      style={{
                        fontSize: isActiveAltGr ? 12 : 8,
                        fontWeight: isActiveAltGr ? "bold" : "normal",
                        opacity: isActiveAltGr ? 1 : 0.4,
                        color: "#facc15",
                      }}
                    >
                      {isActiveAltGr ? "🔸 " : ""}
                      {nuktaGlyph}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}