import { useEffect, useRef, useState } from 'react';
import useTypingTest from '../hooks/useTypingTest';

const MODES = ['time', 'custom'];
const TIME_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 25];

const QUOTES = {
  beginner: [
    'Every expert was once a beginner. Keep typing!',
    'Small daily practice creates big results.',
    'Slow progress is still progress.',
  ],
  learner: [
    'You are improving. Consistency is your superpower!',
    'Practice makes progress, not perfection.',
    'Every test makes your fingers smarter.',
  ],
  intermediate: [
    'Great speed! Now focus on accuracy to level up.',
    'You are on the right track. Keep pushing!',
    'Discipline today, speed tomorrow.',
  ],
  advanced: [
    'Excellent typing! You are ahead of most people.',
    'Speed with accuracy is real mastery.',
    'Your hard work is clearly paying off!',
  ],
  expert: [
    'Outstanding! You are typing like a pro.',
    'Elite speed! Keep defending your record.',
    'Legendary fingers at work!',
  ],
};

const PRESET_PARAGRAPHS = [
  {
    title: '🌍 Countries of the World',
    text: 'There are more than 195 countries in the world spread across seven continents each with its own culture history language and traditions. Asia is the largest and most populated continent in the world. It is known as the birthplace of many ancient civilizations religions and inventions. Asia is home to famous landmarks like the Great Wall of China the Himalayas and modern technological nations. Africa is often called the cradle of humanity because some of the earliest human civilizations began there. It is famous for its wildlife deserts rivers and cultural diversity. Europe is known for its rich history art science and architecture. Many important historical events including the Renaissance and Industrial Revolution started in Europe. North America is a continent filled with natural wonders advanced cities and diverse cultures. South America is known for the Amazon Rainforest the Andes Mountains and colorful traditions. Oceania is the smallest continent by land area and is surrounded by the Pacific Ocean. Antarctica is the coldest continent in the world and does not have any permanent countries or cities. Together these continents and countries make our world diverse fascinating and connected.',
  },
  {
    title: '🗳️ What is Democracy',
    text: 'Democracy is a system of government where the people of a country choose their leaders by voting. In simple words democracy means rule by the people. Instead of one king dictator or small group controlling everything the citizens have the power to decide who will lead the country and make important laws. In a democracy people usually vote in elections every few years. Different political parties and leaders explain their ideas plans and promises to the public. Citizens then choose the leaders they trust the most. Democracy works on a few simple ideas. First every citizen has equal rights and an equal vote. Second laws apply to everyone equally including leaders. Third people are free to speak share opinions practice religion and criticize the government peacefully. Fourth if citizens are unhappy with their leaders they can vote for different leaders in the next election. Countries like India the United States Canada Japan Germany and many others are democratic nations. In India people vote to elect representatives such as Members of Parliament and state leaders. These representatives then make decisions about education roads healthcare jobs security and other important matters. Democracy is important because it gives ordinary people a voice in how their country is run. It encourages freedom equality and participation. However democracy also requires responsible citizens fair elections honest leaders and respect for laws.',
  },
  {
    title: '⚖️ What is Socialism',
    text: 'Socialism is a political and economic system where the government or the people together control important things like healthcare education transportation electricity water and large industries so that everyone in society can benefit equally. The main idea of socialism is fairness making sure rich and poor people both have access to basic needs and opportunities. In simple words socialism believes that a country wealth and resources should help all people not only a small number of rich individuals or companies. It tries to reduce the gap between the rich and the poor. Imagine a village where only a few people own all the farms water and food. The rich become richer while poor people struggle to survive. Socialism says that important resources should be shared more fairly so everyone can live a decent life. In socialist systems the government often collects taxes from people and businesses. That money is then used to provide public services such as free or affordable education hospitals and healthcare public transport financial support for poor people and roads electricity and water services. Many modern countries use a mix of socialism and capitalism. Countries like Sweden Norway Canada and even India use some socialist ideas such as public schools government hospitals and welfare programs while also allowing private businesses and companies to operate. Supporters of socialism say it helps reduce poverty provides equal opportunities and protects ordinary people.',
  },
  {
    title: '👨‍👩‍👧 Why Parents Want Engineers',
    text: 'In India many parents dream that their children will become engineers or doctors. This thinking has been common for many decades and comes from deep cultural economic and social reasons. Understanding why parents push their kids toward engineering helps us see the bigger picture of Indian society its values and its aspirations. Engineering has long been seen as a symbol of stability and success in India. After independence India focused heavily on industrialization and technical development. Institutions like the Indian Institutes of Technology were established and engineers became highly respected in society. Over time this created a cultural belief that engineering equals a good life. Parents who struggled financially naturally wanted their children to have secure well paying jobs. Engineering especially in fields like computer science electronics and mechanical offered exactly that kind of stability. A government or private sector engineering job meant a steady income housing allowance and social respect. Another big reason is social pressure and comparison. In many Indian communities parents are judged by what their children achieve. If a neighbor child becomes an engineer the family gains respect and status. This comparison culture pushes many parents to guide their children toward the same path without always considering the child individual interests or talents. Engineering colleges also became easier to access over time. With thousands of colleges across India getting an engineering degree became more achievable for middle class families. Parents saw it as a practical investment in their child future. However times are changing slowly. Many young people today are choosing careers in arts music design entrepreneurship and sports.',
  },
];

function Stat({ label, value }) {
  return (
    <div className="text-center min-w-[4.5rem]">
      <p className="text-3xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs uppercase tracking-wider mt-0.5 opacity-60">{label}</p>
    </div>
  );
}

function ProgressBar({ current, total, mode, timeLeft, duration, theme }) {
  const progress = mode === 'time'
    ? Math.max(0, Math.min(100, (timeLeft / duration) * 100))
    : Math.max(0, Math.min(100, (current / total) * 100));

  const getGradient = () => {
    if (theme === 'dark') return 'linear-gradient(90deg, #4b5563, #6b7280, #9ca3af)';
    if (theme === 'sepia') return 'linear-gradient(90deg, #c4a35a, #d2b48c, #e0c8a0)';
    return 'linear-gradient(90deg, #9ca3af, #b0b8c5, #cbd5e1)';
  };

  const getEmoji = () => {
    if (mode === 'time') {
      const pct = (timeLeft / duration) * 100;
      if (pct > 70) return "😎";
      if (pct > 40) return "⚡";
      if (pct > 15) return "⏰";
      if (pct > 0) return "💨";
      return "💥";
    }
    const pct = (current / total) * 100;
    if (pct > 70) return "🔥";
    if (pct > 40) return "💪";
    if (pct > 15) return "📝";
    return "🌱";
  };

  const getMessage = () => {
    if (mode === 'time') {
      const pct = (timeLeft / duration) * 100;
      if (pct > 70) return "On fire!";
      if (pct > 40) return "Keep going!";
      if (pct > 15) return "Tick tock!";
      if (pct > 0) return "Almost there!";
      return "Times up!";
    }
    const pct = (current / total) * 100;
    if (pct > 70) return "Almost done!";
    if (pct > 40) return "Halfway there!";
    if (pct > 15) return "Keep going!";
    return "Just started!";
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="opacity-60">{mode === 'time' ? 'Time Remaining' : 'Words Completed'}</span>
        <span className="font-mono opacity-70">{mode === 'time' ? `${Math.floor(progress)}%` : `${current}/${total} words`}</span>
      </div>
      <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300 ease-out opacity-60" style={{ width: `${progress}%`, background: getGradient() }} />
      </div>
      <div className="flex items-center gap-1.5 text-xs opacity-50">
        <span className="text-sm">{getEmoji()}</span>
        <span>{getMessage()}</span>
      </div>
    </div>
  );
}

function ResultCard({ title, value, icon, theme, subtitle }) {
  const getCardStyle = () => {
    if (theme === 'dark') return 'bg-white/5 border-white/10 hover:bg-white/10';
    if (theme === 'sepia') return 'bg-black/10 border-amber-800/20 hover:bg-black/20';
    return 'bg-black/5 border-gray-300/30 hover:bg-black/10';
  };
  const getTextColor = () => {
    if (theme === 'dark') return 'text-white';
    if (theme === 'sepia') return 'text-[#5a4a2e]';
    return 'text-gray-800';
  };
  const getIconColor = () => {
    if (theme === 'dark') return 'text-yellow-400';
    if (theme === 'sepia') return 'text-amber-700';
    return 'text-blue-600';
  };
  const getSubtitleColor = () => {
    if (theme === 'dark') return 'text-white/40';
    if (theme === 'sepia') return 'text-[#8a6e4a]';
    return 'text-gray-500';
  };
  return (
    <div className={`group relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 min-w-[140px] text-center transition-all duration-300 hover:scale-105 ${getCardStyle()}`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white to-transparent" />
      <div className="relative z-10">
        <div className={`text-3xl mb-2 ${getIconColor()}`}>{icon}</div>
        <p className={`text-4xl font-bold tabular-nums ${getTextColor()}`}>{value}</p>
        <p className={`text-xs uppercase tracking-wider opacity-60 mt-2 ${getTextColor()}`}>{title}</p>
        {subtitle && <p className={`text-[10px] mt-1 ${getSubtitleColor()}`}>{subtitle}</p>}
      </div>
    </div>
  );
}

function Heatmap({ keyErrors, theme }) {
  const commonKeys = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',' ','.'];
  const maxErrors = Math.max(...Object.values(keyErrors), 1);
  const getHeatColor = (count) => {
    const intensity = Math.min(1, count / maxErrors);
    if (theme === 'dark') return `rgba(250, 204, 21, ${0.3 + intensity * 0.5})`;
    if (theme === 'sepia') return `rgba(210, 180, 140, ${0.3 + intensity * 0.6})`;
    return `rgba(59, 130, 246, ${0.2 + intensity * 0.5})`;
  };
  const getTextColor = () => {
    if (theme === 'dark') return 'text-white';
    if (theme === 'sepia') return 'text-[#5a4a2e]';
    return 'text-gray-800';
  };
  return (
    <div className="flex flex-wrap gap-1 justify-center max-w-md">
      {commonKeys.map(key => {
        const errors = keyErrors[key] || 0;
        if (errors === 0) return null;
        return (
          <div key={key} className={`text-xs font-mono px-2 py-1 rounded transition-all hover:scale-110 ${getTextColor()}`} style={{ backgroundColor: getHeatColor(errors) }} title={`${key}: ${errors} errors`}>
            {key === ' ' ? '␣' : key}
          </div>
        );
      })}
    </div>
  );
}

export default function TypingTest({ theme, themeStyles: t }) {
  const [mode, setMode] = useState('time');
  const [customText, setCustomText] = useState('');
  const [customReady, setCustomReady] = useState(false);
  const [selectedTime, setSelectedTime] = useState(60);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const customWords = customText.trim().split(/\s+/).filter(Boolean);

  const {
    words, loading, error, input, wordIndex,
    timeLeft, finished, wpm, accuracy,
    consistencyScore, bestStreak, personalBest,
    isNewRecord, keyErrors, wordStatuses, typedWords, wpmHistory,
    handleInput, reset, getCharStatus, loadWords,
  } = useTypingTest(mode, customWords, selectedTime);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!finished) inputRef.current?.focus();
  }, [loading, finished, customReady]);

  useEffect(() => {
    if (!containerRef.current || finished) return;
    const active = containerRef.current.querySelector('[data-cursor="true"]');
    if (!active) return;
    active.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [wordIndex, input]);

  const handleModeChange = (m) => {
    setMode(m);
    setCustomReady(false);
    setCustomText('');
    setSelectedPreset(null);
    reset();
  };

  const handleTimeChange = (min) => {
    setSelectedTime(min * 60);
    reset();
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.title);
    setCustomText(preset.text);
  };

  const formattedTime = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;

  // ✅ Direct, vector-based PDF download (no screenshot, no pop-up, no oklch crash)
  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');

      const doneWords = words.slice(0, wordIndex);
      const totalTyped = doneWords.length;
      const wrongCount = doneWords.filter((_, i) => wordStatuses?.[i] === 'incorrect').length;
      const correctCount = totalTyped - wrongCount;

      let level = 'Beginner', tier = 'beginner';
      if (wpm >= 80) { level = 'Expert'; tier = 'expert'; }
      else if (wpm >= 60) { level = 'Advanced'; tier = 'advanced'; }
      else if (wpm >= 40) { level = 'Intermediate'; tier = 'intermediate'; }
      else if (wpm >= 20) { level = 'Learner'; tier = 'learner'; }
      const quote = QUOTES[tier][Math.floor(Math.random() * QUOTES[tier].length)];

      const nextTarget = [20, 40, 60, 80].find((x) => x > wpm);
      const goalPct = nextTarget ? Math.min(100, Math.round((wpm / nextTarget) * 100)) : 100;
      const goalText = nextTarget
        ? `${nextTarget - wpm} more WPM to reach the next level (${nextTarget} WPM)`
        : 'Maximum level reached. You are a typing legend!';

      const badges = [];
      if (wpm >= 60) badges.push('SPEEDSTER');
      if (accuracy >= 98 && totalTyped >= 10) badges.push('ACCURACY ACE');
      if (bestStreak >= 20) badges.push('STREAK MASTER');
      if (consistencyScore >= 85 && totalTyped >= 20) badges.push('CONSISTENT');
      if (wrongCount === 0 && totalTyped >= 10) badges.push('PERFECT RUN');
      if (isNewRecord) badges.push('NEW RECORD');
      if (badges.length === 0) badges.push('GETTING STARTED');

      const topKeys = Object.entries(keyErrors || {})
        .filter(([k]) => k.trim() !== '')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      let tip = 'Great balance of speed and accuracy. Keep practicing daily!';
      if (totalTyped < 10) tip = 'Type a longer test to get more accurate insights.';
      else if (accuracy < 90) tip = 'Slow down a little. Accuracy comes first, speed follows automatically.';
      else if (consistencyScore < 60) tip = 'Try to keep a steady rhythm. Avoid rushing and then stopping.';
      else if (topKeys.length) tip = `Practice these keys more: ${topKeys.slice(0, 3).map(([k]) => k.toUpperCase()).join(', ')}.`;

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const PW = doc.internal.pageSize.getWidth();
      const PH = doc.internal.pageSize.getHeight();
      const M = 40;
      const CW = PW - M * 2;
      let y = 0;

      const DARK = [2, 6, 23];
      const NAVY = [15, 23, 42];
      const YELLOW = [250, 204, 21];
      const RED = [220, 38, 38];
      const GREEN = [22, 163, 74];
      const GRAY = [100, 116, 139];
      const LIGHT = [248, 250, 252];
      const BORDER = [226, 232, 240];
      const WHITE = [255, 255, 255];

      const newPage = () => { doc.addPage(); y = M; return y; };
      const ensure = (h) => { if (y + h > PH - M) newPage(); };

      // Header
      doc.setFillColor(...DARK);
      doc.rect(0, 0, PW, 150, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(...WHITE);
      doc.text('Type', M, 40);
      const typeW = doc.getTextWidth('Type');
      doc.setTextColor(...YELLOW);
      doc.text('Hanuman', M + typeW, 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(180, 190, 210);
      const modeText = mode === 'time' ? `Time Test - ${selectedTime / 60} min` : 'Custom Paragraph';
      doc.text('TYPING RESULT REPORT', PW - M, 30, { align: 'right' });
      doc.text(new Date().toLocaleString(), PW - M, 42, { align: 'right' });
      doc.text(modeText, PW - M, 54, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(60);
      doc.setTextColor(...YELLOW);
      doc.text(String(wpm), M, 115);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 160, 180);
      doc.text('WORDS PER MINUTE', M, 130);

      doc.setFillColor(...YELLOW);
      doc.roundedRect(M, 138, doc.getTextWidth(level) + 24, 18, 9, 9, 'F');
      doc.setTextColor(...DARK);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(level, M + 12, 150);

      y = 175;

      // Badges
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      let bx = M;
      badges.forEach((b) => {
        const w = doc.getTextWidth(b) + 16;
        if (bx + w > M + CW) { bx = M; y += 22; }
        doc.setFillColor(254, 249, 195);
        doc.setDrawColor(253, 224, 71);
        doc.roundedRect(bx, y, w, 18, 9, 9, 'FD');
        doc.setTextColor(133, 77, 14);
        doc.text(b, bx + 8, y + 12);
        bx += w + 6;
      });
      y += 34;

      // Stat grid
      const stats = [
        [`${accuracy}%`, 'Accuracy'],
        [`${consistencyScore}%`, 'Consistency'],
        [`${bestStreak}`, 'Best Streak'],
        [`${personalBest}`, 'Personal Best'],
        [`${totalTyped}`, 'Words Typed'],
        [`${correctCount}`, 'Correct'],
        [`${wrongCount}`, 'Wrong'],
        [mode === 'time' ? `${selectedTime / 60}m` : 'Custom', 'Test'],
      ];
      const cardW = (CW - 3 * 8) / 4;
      const cardH = 55;
      stats.forEach(([val, label], i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const cx = M + col * (cardW + 8);
        const cy = y + row * (cardH + 8);
        doc.setFillColor(...LIGHT);
        doc.setDrawColor(...BORDER);
        doc.roundedRect(cx, cy, cardW, cardH, 6, 6, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...NAVY);
        doc.text(String(val), cx + cardW / 2, cy + 26, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...GRAY);
        doc.text(label.toUpperCase(), cx + cardW / 2, cy + 42, { align: 'center' });
      });
      y += 2 * (cardH + 8) + 14;

      // Quote
      ensure(64);
      doc.setFillColor(...NAVY);
      doc.roundedRect(M, y, CW, 44, 8, 8, 'F');
      doc.setDrawColor(...YELLOW);
      doc.setLineWidth(3);
      doc.line(M, y + 4, M, y + 40);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(11);
      doc.setTextColor(...WHITE);
      doc.text(doc.splitTextToSize(`"${quote}"`, CW - 30), M + 16, y + 20);
      y += 64;

      // Speed chart
      if (wpmHistory && wpmHistory.length >= 2) {
        ensure(120);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...NAVY);
        doc.text('Speed Over Time', M, y);
        y += 10;
        const chartH = 90;
        doc.setFillColor(...NAVY);
        doc.roundedRect(M, y, CW, chartH, 6, 6, 'F');
        const max = Math.max(...wpmHistory, 10);
        const pad = 12;
        const pts = wpmHistory.map((v, i) => [
          M + pad + (i * (CW - 2 * pad)) / (wpmHistory.length - 1),
          y + chartH - pad - (v / max) * (chartH - 2 * pad),
        ]);
        doc.setDrawColor(...YELLOW);
        doc.setLineWidth(2);
        for (let i = 0; i < pts.length - 1; i++) doc.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
        doc.setFillColor(...YELLOW);
        pts.forEach(([px, py]) => doc.circle(px, py, 2, 'F'));
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(180, 190, 210);
        doc.text(`Peak ${max} WPM`, M + pad, y + 14);
        y += chartH + 20;
      }

      // Next goal
      ensure(80);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...NAVY);
      doc.text('Next Goal', M, y);
      y += 10;
      doc.setFillColor(...BORDER);
      doc.roundedRect(M, y, CW, 10, 5, 5, 'F');
      doc.setFillColor(...YELLOW);
      doc.roundedRect(M, y, (CW * goalPct) / 100, 10, 5, 5, 'F');
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      doc.text(goalText, M, y);
      y += 20;

      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      const tipLines = doc.splitTextToSize(`Tip: ${tip}`, CW - 24);
      const tipH = tipLines.length * 12 + 14;
      ensure(tipH);
      doc.roundedRect(M, y, CW, tipH, 6, 6, 'FD');
      doc.setTextColor(6, 95, 70);
      doc.text(tipLines, M + 12, y + 16);
      y += tipH + 20;

      // Typed text
      ensure(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...NAVY);
      doc.text('Your Typing', M, y);
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text('Red = wrong letters   |   Red box = whole word wrong', M, y);
      y += 14;

      doc.setFont('courier', 'normal');
      doc.setFontSize(11);
      let x = M;
      const lineH = 18;
      ensure(lineH);

      doneWords.forEach((correct, i) => {
        const wrong = wordStatuses?.[i] === 'incorrect';
        const typed = typedWords?.[i] || '';
        const display = wrong ? (typed || correct) : correct;
        const w = doc.getTextWidth(display + ' ');
        if (x + w > M + CW) { x = M; y += lineH; ensure(lineH); }

        if (wrong) {
          let matches = 0;
          for (let k = 0; k < Math.min(typed.length, correct.length); k++) if (typed[k] === correct[k]) matches++;
          if (!typed || matches === 0) {
            const bw = doc.getTextWidth(display) + 6;
            doc.setFillColor(254, 226, 226);
            doc.setDrawColor(252, 165, 165);
            doc.roundedRect(x - 2, y - 11, bw, 15, 3, 3, 'FD');
            doc.setTextColor(...RED);
            doc.text(display, x, y);
          } else {
            let cx2 = x;
            for (let k = 0; k < display.length; k++) {
              const ch = display[k];
              const ok = k < correct.length && ch === correct[k];
              doc.setTextColor(...(ok ? NAVY : RED));
              doc.text(ch, cx2, y);
              cx2 += doc.getTextWidth(ch);
            }
          }
        } else {
          doc.setTextColor(...NAVY);
          doc.text(display, x, y);
        }
        x += w;
      });
      y += lineH + 20;

      // Mistakes table
      const mistakes = doneWords
        .map((w, i) => ({ correct: w, typed: typedWords?.[i] || '', i }))
        .filter(({ i }) => wordStatuses?.[i] === 'incorrect');

      ensure(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...NAVY);
      doc.text('Mistakes', M, y);
      y += 12;

      if (mistakes.length === 0) {
        doc.setFillColor(236, 253, 245);
        doc.roundedRect(M, y, CW, 30, 6, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(4, 120, 87);
        doc.text('No mistakes at all. Perfect typing!', M + CW / 2, y + 19, { align: 'center' });
        y += 40;
      } else {
        const rowH = 18;
        const col1 = M, col2 = M + 250, colEnd = M + CW;
        doc.setFillColor(...NAVY);
        doc.rect(M, y, CW, rowH, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...WHITE);
        doc.text('You typed', col1 + 8, y + 12);
        doc.text('Correct word', col2 + 8, y + 12);
        y += rowH;

        doc.setFont('courier', 'normal');
        doc.setFontSize(10);
        mistakes.slice(0, 40).forEach(({ typed, correct }) => {
          ensure(rowH);
          doc.setDrawColor(...BORDER);
          doc.line(M, y + rowH, colEnd, y + rowH);
          let cx2 = col1 + 8;
          if (!typed) {
            doc.setTextColor(...RED);
            doc.text('(blank)', cx2, y + 13);
          } else {
            for (let k = 0; k < typed.length; k++) {
              const ok = k < correct.length && typed[k] === correct[k];
              doc.setTextColor(...(ok ? NAVY : RED));
              doc.text(typed[k], cx2, y + 13);
              cx2 += doc.getTextWidth(typed[k]);
            }
          }
          doc.setTextColor(...GREEN);
          doc.text(correct, col2 + 8, y + 13);
          y += rowH;
        });
        if (mistakes.length > 40) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...GRAY);
          doc.text(`+ ${mistakes.length - 40} more mistakes not shown`, M, y + 12);
          y += 20;
        }
        y += 14;
      }

      // Problem keys
      ensure(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...NAVY);
      doc.text('Problem Keys', M, y);
      y += 14;
      if (!topKeys.length) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...GRAY);
        doc.text('No problem keys', M, y);
        y += 20;
      } else {
        let kx = M;
        doc.setFont('courier', 'bold');
        doc.setFontSize(11);
        topKeys.forEach(([k, n]) => {
          const label = `${k}  (${n})`;
          const w = doc.getTextWidth(label) + 20;
          if (kx + w > M + CW) { kx = M; y += 26; }
          doc.setFillColor(254, 243, 199);
          doc.setDrawColor(252, 211, 77);
          doc.roundedRect(kx, y - 12, w, 20, 5, 5, 'FD');
          doc.setTextColor(146, 64, 14);
          doc.text(label, kx + 10, y + 2);
          kx += w + 6;
        });
        y += 30;
      }

      // Footer on every page
      const pageCount = doc.internal.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFillColor(...DARK);
        doc.rect(0, PH - 28, PW, 28, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 210);
        doc.text('Generated by TypeHanuman.com - Keep practicing every day', PW / 2, PH - 12, { align: 'center' });
      }

      doc.save(`TypeHanuman-Result-${wpm}WPM.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Could not create the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const colors = t;

  if (loading && mode !== 'custom') return <p className="opacity-50 text-center py-20">Loading words...</p>;

  if (error) return (
    <div className="text-center py-20 space-y-4">
      <p className="text-red-400">{error}</p>
      <button onClick={loadWords} className="text-sm underline opacity-50 hover:opacity-100">Try again</button>
    </div>
  );

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 max-w-4xl mx-auto w-full">
        {isNewRecord && (
          <div className={`backdrop-blur-xl border rounded-full px-6 py-2 ${theme === 'dark' ? 'bg-yellow-500/20 border-yellow-400/30' : theme === 'sepia' ? 'bg-amber-500/20 border-amber-600/30' : 'bg-blue-500/20 border-blue-400/30'}`}>
            <p className={`font-medium text-sm ${theme === 'dark' ? 'text-yellow-400' : theme === 'sepia' ? 'text-amber-700' : 'text-blue-600'}`}>NEW PERSONAL BEST!</p>
          </div>
        )}
        <div className="text-center">
          <p className={`text-[clamp(3rem,10vw,7rem)] font-bold tabular-nums ${
            theme === 'dark' ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400'
            : theme === 'sepia' ? 'text-transparent bg-clip-text bg-gradient-to-b from-[#5a4a2e] to-[#a0906e]'
            : 'text-transparent bg-clip-text bg-gradient-to-b from-gray-800 to-gray-400'
          }`}>{wpm}</p>
          <p className={`text-xs uppercase tracking-widest mt-2 ${colors.textMuted}`}>Words Per Minute</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <ResultCard title="Accuracy" value={`${accuracy}%`} icon="🎯" theme={theme} subtitle={accuracy >= 98 ? "Elite!" : accuracy >= 95 ? "Exceptional!" : "Great work!"} />
          <ResultCard title="Consistency" value={`${consistencyScore}%`} icon="📊" theme={theme} subtitle="Speed stability" />
          <ResultCard title="Best Streak" value={bestStreak} icon="🔥" theme={theme} subtitle="Error-free run" />
          <ResultCard title="Personal Best" value={personalBest} icon="🏆" theme={theme} subtitle={isNewRecord ? "NEW!" : "All time"} />
        </div>
        <div className={`${colors.glassCard} p-4 w-full max-w-md text-center`}>
          <button onClick={() => setShowHeatmap(!showHeatmap)} className={`text-xs uppercase tracking-wider flex items-center gap-2 mx-auto ${colors.textMuted}`}>
            Problem Keys {showHeatmap ? '▲' : '▼'}
          </button>
          {showHeatmap && (
            <div className="mt-3">
              <Heatmap keyErrors={keyErrors} theme={theme} />
              <p className={`text-xs mt-2 ${colors.textMuted}`}>Hotter = more errors</p>
            </div>
          )}
        </div>
        <div className="text-center">
          <p className={`text-xl font-medium ${colors.textNormal}`}>
            {wpm >= 80 ? "Blazing fast!" : wpm >= 60 ? "Great speed!" : wpm >= 40 ? "Good job!" : wpm >= 20 ? "Keep practicing!" : "Just getting started!"}
          </p>
        </div>
        <div className="flex gap-4 flex-wrap justify-center pt-2">
          <button onClick={reset} className={`px-8 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105 ${theme === 'dark' ? 'bg-white text-black' : theme === 'sepia' ? 'bg-[#5a4a2e] text-white' : 'bg-gray-800 text-white'}`}>
            Try Again
          </button>
          <button onClick={() => handleModeChange('time')} className={`px-8 py-3 rounded-xl text-sm transition-all hover:scale-105 ${colors.glassButton} ${colors.textNormal}`}>
            New Test
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`px-8 py-3 rounded-xl text-sm transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-wait ${colors.glassButton} ${colors.textNormal}`}
          >
            {downloading ? '⏳ Preparing PDF...' : '⬇ Download Result (PDF)'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 max-w-5xl mx-auto w-full gap-6">

      {/* Mode Buttons */}
      <div className="flex justify-center gap-2 flex-wrap">
        {MODES.map((m) => (
          <button key={m} onClick={() => handleModeChange(m)} className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-all ${mode === m ? colors.glassButtonActive : colors.glassButton} ${colors.textNormal}`}>
            {m}
          </button>
        ))}
      </div>

      {/* Time Options */}
      {mode === 'time' && (
        <div className="flex justify-center gap-2 flex-wrap">
          {TIME_OPTIONS.map((min) => (
            <button key={min} onClick={() => handleTimeChange(min)} className={`px-3 py-1 rounded-lg text-xs transition-all ${selectedTime === min * 60 ? colors.glassButtonActive : colors.glassButton} ${colors.textNormal}`}>
              {`${min} min`}
            </button>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {(mode !== 'custom' || customReady) && (
        <ProgressBar current={wordIndex} total={words.length} mode={mode} timeLeft={timeLeft} duration={selectedTime} theme={theme} />
      )}

      {/* Custom Mode */}
      {mode === 'custom' && !customReady && (
        <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">

          <div>
            <p className={`text-sm text-center mb-3 ${colors.textMuted}`}>Choose a paragraph or paste your own</p>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_PARAGRAPHS.map((preset) => (
                <button
                  key={preset.title}
                  onClick={() => handlePresetSelect(preset)}
                  className={`text-left px-4 py-3 rounded-xl text-sm transition-all ${
                    selectedPreset === preset.title
                      ? colors.glassButtonActive
                      : colors.glassButton
                  } ${colors.textNormal}`}
                >
                  <span className="font-medium">{preset.title}</span>
                  <span className={`ml-2 text-xs ${colors.textMuted}`}>
                    {preset.text.split(' ').length} words
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className={`text-xs ${colors.textMuted}`}>or paste your own</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <textarea
            className={`w-full h-28 rounded-xl p-4 text-sm resize-none outline-none ${colors.glassCard} ${colors.textNormal}`}
            placeholder="Paste any paragraph here..."
            value={customText}
            onChange={(e) => { setCustomText(e.target.value); setSelectedPreset(null); }}
          />

          <button
            onClick={() => customText.trim().length > 0 && setCustomReady(true)}
            className={`mx-auto px-8 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
              customText.trim().length > 0
                ? (theme === 'dark' ? 'bg-white text-black' : theme === 'sepia' ? 'bg-[#5a4a2e] text-white' : 'bg-gray-800 text-white')
                : colors.glassButton + ' ' + colors.textMuted
            }`}
          >
            Start Typing →
          </button>
        </div>
      )}

      {/* Typing Area */}
      {(mode !== 'custom' || customReady) && (
        <>
          <div className="flex justify-center gap-12 py-2">
            <Stat label="time" value={formattedTime} />
            <Stat label="wpm" value={wpm} />
            <Stat label="acc" value={accuracy} />
          </div>

          <div className="relative">
            <div ref={containerRef} className={`h-80 overflow-hidden rounded-2xl p-8 shadow-xl ${colors.glassCard}`} onClick={() => inputRef.current?.focus()} role="presentation">
              <div className={`text-3xl leading-loose select-none tracking-wide font-mono ${colors.textNormal}`}>
                {words.map((word, wIndex) => (
                  <span 
                    key={`${word}-${wIndex}`} 
                    className={`inline-block mr-3 ${
                      wIndex < wordIndex && wordStatuses?.[wIndex] === 'incorrect'
                        ? 'underline decoration-red-500 decoration-2'
                        : ''
                    } ${wIndex === wordIndex ? 'relative' : ''}`}
                  >
                    {word.split('').map((char, charIndex) => {
                      const status = getCharStatus(wIndex, charIndex);
                      let textColor = colors.untyped;
                      if (status === 'correct') textColor = colors.correct;
                      if (status === 'incorrect') textColor = colors.incorrect;
                      const isCurrentChar = (wIndex === wordIndex && charIndex === input.length);
                      if (isCurrentChar) textColor = colors.current;
                      const showCursor = (wIndex === wordIndex && charIndex === input.length + 1);
                      return (
                        <span key={charIndex} data-cursor={showCursor ? 'true' : undefined} className={`${textColor} transition-colors duration-75 relative inline-block`}>
                          {showCursor && <span className="absolute -left-0.5 top-0 bottom-0 w-0.5" style={{ backgroundColor: colors.cursor, animation: 'blinkCursor 1s step-end infinite' }} />}
                          {char}
                        </span>
                      );
                    })}
                  </span>
                ))}
              </div>
            </div>
            <input ref={inputRef} value={input} onChange={(e) => handleInput(e.target.value)} disabled={finished} className="absolute inset-0 opacity-0 cursor-text" autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
          </div>

          <p className={`text-center text-sm ${colors.textMuted}`}>Click here or start typing — press space after each word</p>
          <button onClick={reset} className={`mx-auto text-sm transition ${colors.textMuted}`}>Reset</button>
        </>
      )}
    </div>
  );
}