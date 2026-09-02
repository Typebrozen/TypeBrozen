// ======================================================
// Shared Theme — single source of truth
//
// Every typing tool (English, Hindi, Kruti Dev later, the
// virtual keyboard) reads its colors from here via the
// `theme` / `themeStyles` props App.jsx already passes down.
//
// TO ADD A NEW THEME: copy one block below, rename the key,
// change the values. Nothing else in the codebase needs to
// change — every tool picks it up automatically.
//
// TO REMOVE A THEME: delete its block. (Also remove it from
// wherever the theme-switcher buttons are generated, if that
// list isn't built from Object.keys(THEMES) already.)
// ======================================================

export const THEMES = {
  dark: {
    // App-level chrome (header, page background, nav buttons)
    bg: 'bg-zinc-950',
    text: 'text-zinc-100',
    header: 'text-zinc-100',
    sub: 'text-zinc-500',
    btn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200',
    activebtn: 'bg-zinc-100 text-zinc-900',

    // Typing-area colors (used by English + Hindi + Kruti Dev tools)
    untyped: 'text-zinc-500',
    correct: 'text-zinc-200',
    incorrect: 'text-red-400',
    current: 'text-yellow-400',
    cursor: '#eab308',
    glassCard: 'backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl',
    glassButton: 'backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10',
    glassButtonActive: 'backdrop-blur-sm bg-white/20 border border-white/30',
    textMuted: 'text-white/40',
    textNormal: 'text-white',

    // Virtual keyboard colors
    keyboardPanel: 'border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950',
    keyboardKey: 'bg-gradient-to-b from-zinc-800 to-zinc-900 border-zinc-950 text-zinc-200',
    keyboardFnKey: 'bg-gradient-to-b from-zinc-700 to-zinc-800 border-zinc-950 text-zinc-300',

    // Solid call-to-action buttons ("Try Again", "Start Typing")
    primaryButton: 'bg-white text-black',
    // Countdown timer urgency colors
    timeSafe: 'text-green-500',
    timeWarn: 'text-yellow-500',
    timeDanger: 'text-red-500',
  },

  light: {
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    header: 'text-gray-900',
    sub: 'text-gray-500',
    btn: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    activebtn: 'bg-gray-900 text-white',

    untyped: 'text-gray-300',
    correct: 'text-gray-700',
    incorrect: 'text-red-500',
    current: 'text-blue-600 font-bold',
    cursor: '#3b82f6',
    glassCard: 'backdrop-blur-xl bg-white/60 border border-gray-300/50 rounded-2xl',
    glassButton: 'backdrop-blur-sm bg-white/50 border border-gray-300/40 hover:bg-white/70',
    glassButtonActive: 'backdrop-blur-sm bg-gray-200/70 border border-gray-400/50',
    textMuted: 'text-gray-500',
    textNormal: 'text-gray-800',

    keyboardPanel: 'border-gray-200 bg-gradient-to-b from-gray-50 to-white',
    keyboardKey: 'bg-gradient-to-b from-white to-gray-100 border-gray-300 text-gray-700',
    keyboardFnKey: 'bg-gradient-to-b from-gray-200 to-gray-300 border-gray-400 text-gray-600',

    primaryButton: 'bg-gray-800 text-white',
    timeSafe: 'text-green-600',
    timeWarn: 'text-yellow-600',
    timeDanger: 'text-red-600',
  },

  sepia: {
    bg: 'bg-[#f4f0e8]',
    text: 'text-[#5a4a2e]',
    header: 'text-[#5a4a2e]',
    sub: 'text-[#a0906e]',
    btn: 'bg-[#e8e0d0] hover:bg-[#ddd5c0] text-[#5a4a2e]',
    activebtn: 'bg-[#5a4a2e] text-[#f4f0e8]',

    untyped: 'text-amber-700/40',
    correct: 'text-[#5a4a2e]',
    incorrect: 'text-red-600',
    current: 'text-amber-700 font-bold',
    cursor: '#b8860b',
    glassCard: 'backdrop-blur-xl bg-white/40 border border-amber-800/20 rounded-2xl',
    glassButton: 'backdrop-blur-sm bg-white/30 border border-amber-800/20 hover:bg-white/50',
    glassButtonActive: 'backdrop-blur-sm bg-amber-100/50 border border-amber-700/30',
    textMuted: 'text-[#8a6e4a]',
    textNormal: 'text-[#5a4a2e]',

    keyboardPanel: 'border-amber-200 bg-gradient-to-b from-[#f4ecd8] to-[#efe4c8]',
    keyboardKey: 'bg-gradient-to-b from-[#fdf6e3] to-[#f0e6cc] border-amber-300 text-[#5a4a2e]',
    keyboardFnKey: 'bg-gradient-to-b from-amber-200 to-amber-300 border-amber-400 text-[#5a4a2e]',

    primaryButton: 'bg-[#5a4a2e] text-white',
    timeSafe: 'text-green-700',
    timeWarn: 'text-amber-700',
    timeDanger: 'text-red-700',
  },
};