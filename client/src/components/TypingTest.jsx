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

  // ✅ Direct PDF download (no pop-up)
  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const esc = (s) =>
        String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const doneWords = words.slice(0, wordIndex);
      const totalTyped = doneWords.length;
      const wrongCount = doneWords.filter((_, i) => wordStatuses?.[i] === 'incorrect').length;
      const correctCount = totalTyped - wrongCount;

      // ---------- Level, quote, next goal ----------
      let level = 'Beginner', tier = 'beginner', levelColor = '#94a3b8';
      if (wpm >= 80) { level = 'Expert'; tier = 'expert'; levelColor = '#f43f5e'; }
      else if (wpm >= 60) { level = 'Advanced'; tier = 'advanced'; levelColor = '#a855f7'; }
      else if (wpm >= 40) { level = 'Intermediate'; tier = 'intermediate'; levelColor = '#3b82f6'; }
      else if (wpm >= 20) { level = 'Learner'; tier = 'learner'; levelColor = '#10b981'; }
      const quote = QUOTES[tier][Math.floor(Math.random() * QUOTES[tier].length)];

      const nextTarget = [20, 40, 60, 80].find((x) => x > wpm);
      const goalPct = nextTarget ? Math.min(100, Math.round((wpm / nextTarget) * 100)) : 100;
      const goalText = nextTarget
        ? `${nextTarget - wpm} more WPM to reach the next level (${nextTarget} WPM)`
        : 'Maximum level reached. You are a typing legend!';

      // ---------- Achievements ----------
      const badges = [];
      if (wpm >= 60) badges.push(['⚡', 'Speedster']);
      if (accuracy >= 98 && totalTyped >= 10) badges.push(['🎯', 'Accuracy Ace']);
      if (bestStreak >= 20) badges.push(['🔥', 'Streak Master']);
      if (consistencyScore >= 85 && totalTyped >= 20) badges.push(['📊', 'Consistent']);
      if (wrongCount === 0 && totalTyped >= 10) badges.push(['💎', 'Perfect Run']);
      if (isNewRecord) badges.push(['🏆', 'New Record']);
      if (badges.length === 0) badges.push(['🌱', 'Getting Started']);
      const badgesHtml = badges
        .map(([ic, nm]) => `<span class="th-badge">${ic} ${nm}</span>`)
        .join('');

      // ---------- Typed text (wrong letters red / whole word red box) ----------
      const renderWord = (correct, i) => {
        if (wordStatuses?.[i] !== 'incorrect') return `<span class="th-w">${esc(correct)}</span>`;
        const typed = typedWords?.[i] || '';
        if (!typed) return `<span class="th-w th-whole">${esc(correct)}</span>`;

        let matches = 0;
        for (let k = 0; k < Math.min(typed.length, correct.length); k++) {
          if (typed[k] === correct[k]) matches++;
        }
        if (matches === 0) return `<span class="th-w th-whole">${esc(typed)}</span>`;

        const len = Math.max(typed.length, correct.length);
        let out = '';
        for (let k = 0; k < len; k++) {
          if (k < typed.length) {
            out += typed[k] === correct[k]
              ? esc(typed[k])
              : `<span class="th-bad">${esc(typed[k])}</span>`;
          } else {
            out += `<span class="th-bad">_</span>`;
          }
        }
        return `<span class="th-w">${out}</span>`;
      };
      const bodyHtml = doneWords.map(renderWord).join(' ');

      // ---------- Mistakes table ----------
      const typedWithRed = (typed, correct) => {
        let matches = 0;
        for (let k = 0; k < Math.min(typed.length, correct.length); k++) {
          if (typed[k] === correct[k]) matches++;
        }
        if (matches === 0) return `<span class="th-bad">${esc(typed)}</span>`;
        let out = '';
        for (let k = 0; k < typed.length; k++) {
          out += typed[k] === correct[k]
            ? esc(typed[k])
            : `<span class="th-bad">${esc(typed[k])}</span>`;
        }
        return out;
      };

      const mistakes = doneWords
        .map((w, i) => ({ correct: w, typed: typedWords?.[i] || '', i }))
        .filter(({ i }) => wordStatuses?.[i] === 'incorrect');

      const rows = mistakes.slice(0, 30).map(({ typed, correct }, n) => `
        <tr class="th-avoid">
          <td class="th-num">${n + 1}</td>
          <td>${typed ? typedWithRed(typed, correct) : '<span class="th-bad">(blank)</span>'}</td>
          <td class="th-good">${esc(correct)}</td>
        </tr>`).join('');

      const mistakesHtml = mistakes.length
        ? `<table class="th-table">
             <thead><tr><th style="width:40px">#</th><th>You typed</th><th>Correct word</th></tr></thead>
             <tbody>${rows}</tbody>
           </table>
           ${mistakes.length > 30 ? `<p class="th-small">+ ${mistakes.length - 30} more mistakes not shown</p>` : ''}`
        : `<div class="th-perfect">🎉 No mistakes at all. Perfect typing!</div>`;

      // ---------- Problem keys ----------
      const topKeys = Object.entries(keyErrors || {})
        .filter(([k]) => k.trim() !== '')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
      const keysHtml = topKeys.length
        ? topKeys.map(([k, n]) => `<span class="th-key">${esc(k)}<b>${n}</b></span>`).join('')
        : '<span class="th-small">No problem keys 👏</span>';

      // ---------- Personal tip ----------
      let tip = 'Great balance of speed and accuracy. Keep practicing daily!';
      if (totalTyped < 10) tip = 'Type a longer test to get more accurate insights.';
      else if (accuracy < 90) tip = 'Slow down a little. Accuracy comes first, speed follows automatically.';
      else if (consistencyScore < 60) tip = 'Try to keep a steady rhythm. Avoid rushing and then stopping.';
      else if (topKeys.length) tip = `Practice these keys more: ${topKeys.slice(0, 3).map(([k]) => k.toUpperCase()).join(', ')}.`;

      // ---------- Speed graph ----------
      let chartHtml = '';
      if (wpmHistory && wpmHistory.length >= 2) {
        const W = 700, H = 150, P = 24;
        const max = Math.max(...wpmHistory, 10);
        const xy = wpmHistory.map((v, i) => {
          const x = P + (i * (W - 2 * P)) / (wpmHistory.length - 1);
          const y = H - P - (v / max) * (H - 2 * P);
          return [x, y];
        });
        const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
        const area = `${P},${H - P} ${line} ${W - P},${H - P}`;
        const dots = xy.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#facc15"/>`).join('');
        chartHtml = `
          <div class="th-section th-avoid">
            <h2>📈 Speed Over Time</h2>
            <div class="th-chart">
              <svg viewBox="0 0 ${W} ${H}" width="700" height="${H}">
                <line x1="${P}" y1="${H - P}" x2="${W - P}" y2="${H - P}" stroke="#334155" stroke-width="1"/>
                <line x1="${P}" y1="${P}" x2="${W - P}" y2="${P}" stroke="#334155" stroke-width="1" stroke-dasharray="4 4"/>
                <polygon points="${area}" fill="rgba(250,204,21,0.18)"/>
                <polyline fill="none" stroke="#facc15" stroke-width="3" stroke-linejoin="round" points="${line}"/>
                ${dots}
                <text x="${P}" y="16" font-size="11" fill="#94a3b8">Peak ${max} WPM</text>
              </svg>
            </div>
          </div>`;
      }

      // ---------- Accuracy ring ----------
      const R = 50, C = 2 * Math.PI * R;
      const dash = (Math.max(0, Math.min(100, accuracy)) / 100) * C;
      const ringHtml = `
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="${R}" fill="none" stroke="#1e293b" stroke-width="12"/>
          <circle cx="70" cy="70" r="${R}" fill="none" stroke="#facc15" stroke-width="12"
            stroke-linecap="round" stroke-dasharray="${dash.toFixed(1)} ${C.toFixed(1)}"
            transform="rotate(-90 70 70)"/>
          <text x="70" y="76" text-anchor="middle" font-size="28" font-weight="700" fill="#ffffff" font-family="Arial">${accuracy}%</text>
          <text x="70" y="96" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="Arial" letter-spacing="1.5">ACCURACY</text>
        </svg>`;

      const modeText = mode === 'time' ? `Time Test • ${selectedTime / 60} min` : 'Custom Paragraph';
      const dateText = new Date().toLocaleString();

      const html = `
<div class="th-report">
<style>
  .th-report, .th-report * { box-sizing: border-box; }
  .th-report { width: 794px; background: #ffffff; color: #0f172a; font-family: Arial, Helvetica, sans-serif; }
  .th-hero { background: linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e293b 100%); color: #fff; padding: 30px 36px 28px; }
  .th-top { display: flex; justify-content: space-between; align-items: center; }
  .th-brand { font-size: 26px; font-weight: 800; letter-spacing: .5px; }
  .th-brand .y { color: #facc15; }
  .th-meta { text-align: right; font-size: 11px; color: #94a3b8; line-height: 1.6; }
  .th-hero-body { display: flex; justify-content: space-between; align-items: center; margin-top: 22px; }
  .th-wpm-num { font-size: 96px; font-weight: 800; line-height: 1; color: #facc15; }
  .th-wpm-lbl { font-size: 12px; letter-spacing: 3px; color: #94a3b8; margin-top: 4px; }
  .th-level { display: inline-block; margin-top: 14px; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #fff; }
  .th-body { padding: 8px 36px 24px; }
  .th-badges { margin: 18px 0 4px; }
  .th-badge { display: inline-block; background: #fef9c3; color: #854d0e; border: 1px solid #fde047; border-radius: 999px; padding: 5px 13px; font-size: 12px; font-weight: 700; margin: 0 6px 6px 0; }
  .th-grid { display: flex; flex-wrap: wrap; margin: 14px -5px 0; }
  .th-card { width: 25%; padding: 5px; }
  .th-card > div { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 6px; text-align: center; background: #f8fafc; }
  .th-card b { display: block; font-size: 24px; color: #0f172a; }
  .th-card span { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #64748b; }
  .th-quote { margin: 18px 0 4px; padding: 16px 20px; background: #0f172a; color: #fff; border-radius: 12px; border-left: 6px solid #facc15; font-size: 15px; font-style: italic; }
  .th-section { margin-top: 20px; }
  .th-section h2 { font-size: 15px; margin: 0 0 10px; color: #0f172a; }
  .th-chart { background: #0f172a; border-radius: 12px; padding: 10px; }
  .th-goal-bar { height: 12px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
  .th-goal-fill { height: 12px; background: linear-gradient(90deg, #facc15, #f59e0b); border-radius: 999px; }
  .th-goal-txt { font-size: 12px; color: #475569; margin-top: 6px; }
  .th-tip { margin-top: 12px; padding: 12px 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; font-size: 13px; color: #065f46; }
  .th-legend { font-size: 11px; color: #64748b; margin-bottom: 8px; }
  .th-text { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; font-size: 15px; line-height: 2.2; background: #ffffff; }
  .th-w { display: inline-block; margin-right: 4px; }
  .th-bad { color: #dc2626; font-weight: 700; text-decoration: underline; }
  .th-whole { background: #fee2e2; color: #dc2626; font-weight: 700; border: 1px solid #fca5a5; border-radius: 6px; padding: 0 6px; }
  .th-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .th-table th { background: #0f172a; color: #fff; padding: 8px 10px; text-align: left; font-size: 12px; }
  .th-table td { border-bottom: 1px solid #e2e8f0; padding: 7px 10px; }
  .th-num { color: #94a3b8; }
  .th-good { color: #16a34a; font-weight: 700; }
  .th-perfect { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 12px; padding: 18px; text-align: center; font-weight: 700; }
  .th-key { display: inline-block; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; padding: 6px 12px; margin: 0 8px 8px 0; font-family: monospace; font-size: 15px; color: #92400e; }
  .th-key b { margin-left: 8px; color: #dc2626; font-size: 12px; }
  .th-small { font-size: 12px; color: #64748b; }
  .th-footer { background: #020617; color: #94a3b8; text-align: center; font-size: 11px; padding: 14px; }
  .th-footer .y { color: #facc15; font-weight: 700; }
</style>

  <div class="th-hero">
    <div class="th-top">
      <div class="th-brand">Type<span class="y">Hanuman</span></div>
      <div class="th-meta">TYPING RESULT REPORT<br>${esc(dateText)}<br>${esc(modeText)}</div>
    </div>
    <div class="th-hero-body">
      <div>
        <div class="th-wpm-num">${wpm}</div>
        <div class="th-wpm-lbl">WORDS PER MINUTE</div>
        <div class="th-level" style="background:${levelColor}">${level}</div>
      </div>
      <div>${ringHtml}</div>
    </div>
  </div>

  <div class="th-body">
    <div class="th-badges">${badgesHtml}</div>

    <div class="th-grid">
      <div class="th-card"><div><b>${consistencyScore}%</b><span>Consistency</span></div></div>
      <div class="th-card"><div><b>${bestStreak}</b><span>Best Streak</span></div></div>
      <div class="th-card"><div><b>${personalBest}</b><span>Personal Best</span></div></div>
      <div class="th-card"><div><b>${mode === 'time' ? selectedTime / 60 + ' min' : 'Custom'}</b><span>Test</span></div></div>
      <div class="th-card"><div><b>${totalTyped}</b><span>Words Typed</span></div></div>
      <div class="th-card"><div><b style="color:#16a34a">${correctCount}</b><span>Correct</span></div></div>
      <div class="th-card"><div><b style="color:#dc2626">${wrongCount}</b><span>Wrong</span></div></div>
      <div class="th-card"><div><b>${accuracy}%</b><span>Accuracy</span></div></div>
    </div>

    <div class="th-quote th-avoid">“${esc(quote)}”</div>

    ${chartHtml}

    <div class="th-section th-avoid">
      <h2>🎯 Next Goal</h2>
      <div class="th-goal-bar"><div class="th-goal-fill" style="width:${goalPct}%"></div></div>
      <div class="th-goal-txt">${esc(goalText)}</div>
      <div class="th-tip">💡 <b>Tip:</b> ${esc(tip)}</div>
    </div>

    <div class="th-section">
      <h2>⌨️ Your Typing</h2>
      <div class="th-legend">
        <span class="th-bad">Red letters</span> = wrong letters &nbsp;•&nbsp;
        <span class="th-whole">Red box</span> = whole word wrong &nbsp;•&nbsp;
        <span class="th-bad">_</span> = missing letter
      </div>
      <div class="th-text">${bodyHtml || '<span class="th-small">No words typed.</span>'}</div>
    </div>

    <div class="th-section">
      <h2>❌ Mistakes</h2>
      ${mistakesHtml}
    </div>

    <div class="th-section th-avoid">
      <h2>🔑 Problem Keys</h2>
      <div>${keysHtml}</div>
    </div>
  </div>

  <div class="th-footer">Generated by <span class="y">TypeHanuman.com</span> • Keep practicing every day 🚀</div>
</div>`;

      const el = document.createElement('div');
      el.innerHTML = html;

      await html2pdf()
        .set({
          margin: [0, 0, 0, 0],
          filename: `TypeHanuman-Result-${wpm}WPM.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['.th-avoid'] },
        })
        .from(el)
        .save();
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