import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import rateLimit from 'express-rate-limit';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// ============ DATABASE (visitor counter + weekly leaderboard) ============
const DATABASE_URL = process.env.DATABASE_URL;
const pool = DATABASE_URL
  ? new pg.Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes('railway.internal') ? false : { rejectUnauthorized: false },
    })
  : null;

async function initDb() {
  if (!pool) {
    console.log('DATABASE_URL not set — visitor counter and leaderboard disabled');
    return;
  }
  await pool.query(
    `CREATE TABLE IF NOT EXISTS visitor_counter (id INT PRIMARY KEY, total BIGINT NOT NULL DEFAULT 0)`
  );
  await pool.query(
    `INSERT INTO visitor_counter (id, total) VALUES (1, 0) ON CONFLICT (id) DO NOTHING`
  );
  console.log('Visitor counter ready');

  // Weekly leaderboard (English, 1 minute test). Old weeks stay saved = Hall of Fame.
  await pool.query(
    `CREATE TABLE IF NOT EXISTS weekly_scores (
       id SERIAL PRIMARY KEY,
       week_start DATE NOT NULL,
       name TEXT NOT NULL,
       wpm NUMERIC(5,1) NOT NULL,
       accuracy NUMERIC(5,1) NOT NULL,
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
     )`
  );
  // One entry per name per week (name is not case-sensitive)
  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS weekly_scores_week_name_uniq
       ON weekly_scores (week_start, lower(name))`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS weekly_scores_week_wpm
       ON weekly_scores (week_start, wpm DESC)`
  );
  console.log('Weekly leaderboard ready');
}
initDb().catch((err) => console.error('Database init failed:', err.message));

const WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us', 'find', 'world', 'life',
  'hand', 'part', 'child', 'place', 'case', 'week', 'company', 'system',
  'program', 'question', 'right', 'study', 'book', 'eye', 'job', 'word',
  'great', 'where', 'help', 'through', 'much', 'before', 'line', 'too',
  'means', 'old', 'tell', 'very', 'man', 'thing', 'name', 'sentence',
  'small', 'every', 'found', 'still', 'between', 'should', 'home', 'big',
  'air', 'set', 'own', 'under', 'read', 'last', 'never', 'left', 'end',
  'why', 'turn', 'here', 'show', 'form', 'differ', 'cause', 'mean', 'move',
  'boy', 'same', 'does', 'three', 'play', 'put', 'large', 'spell', 'add',
  'land', 'must', 'high', 'such', 'follow', 'act', 'ask', 'men', 'change',
  'went', 'light', 'kind', 'off', 'need', 'house', 'picture', 'try', 'again',
  'animal', 'point', 'mother', 'near', 'build', 'self', 'earth', 'father',
  'head', 'stand', 'page', 'country', 'answer', 'school', 'grow', 'learn',
  'plant', 'cover', 'food', 'sun', 'four', 'state', 'keep', 'let', 'thought',
  'city', 'tree', 'cross', 'farm', 'hard', 'start', 'might', 'story', 'saw',
  'far', 'sea', 'draw', 'late', 'run', 'press', 'close', 'night', 'real',
  'few', 'north', 'open', 'seem', 'together', 'next', 'white', 'children',
  'begin', 'got', 'walk', 'example', 'ease', 'paper', 'group', 'always',
  'music', 'those', 'both', 'mark', 'often', 'letter', 'until', 'mile',
  'river', 'car', 'feet', 'care', 'second', 'carry', 'took', 'science',
  'eat', 'room', 'friend', 'began', 'idea', 'fish', 'mountain', 'stop',
  'once', 'base', 'hear', 'horse', 'cut', 'sure', 'watch', 'color', 'face',
  'wood', 'main', 'enough', 'plain', 'girl', 'usual', 'young', 'ready',
  'above', 'ever', 'red', 'list', 'though', 'feel', 'talk', 'bird', 'soon',
  'body', 'dog', 'family', 'direct', 'pose', 'leave', 'song', 'measure',
  'door', 'product', 'black', 'short', 'class', 'wind', 'happen', 'complete',
  'ship', 'area', 'half', 'rock', 'order', 'fire', 'south', 'problem',
  'piece', 'told', 'knew', 'pass', 'since', 'top', 'whole', 'king', 'space',
  'heard', 'best', 'hour', 'better', 'true', 'during', 'hundred', 'five',
  'remember', 'step', 'early', 'hold', 'west', 'ground', 'interest', 'reach',
  'fast', 'verb', 'sing', 'listen', 'six', 'table', 'travel', 'less',
  'morning', 'ten', 'simple', 'several', 'toward', 'war', 'lay', 'against',
  'pattern', 'slow', 'center', 'love', 'person', 'money', 'serve', 'appear',
  'road', 'map', 'rain', 'rule', 'govern', 'pull', 'cold', 'notice', 'voice',
  'unit', 'power', 'town', 'fine', 'certain', 'fly', 'fall', 'lead', 'cry',
  'dark', 'machine', 'note', 'wait', 'plan', 'figure', 'star', 'box', 'noun',
  'field', 'rest', 'correct', 'able', 'done', 'beauty', 'drive', 'stood',
  'contain', 'front', 'teach', 'final', 'gave', 'green', 'quick', 'develop',
  'ocean', 'warm', 'free', 'minute', 'strong', 'special', 'mind', 'behind',
  'clear', 'tail', 'produce', 'fact', 'street', 'inch', 'nothing', 'course',
  'stay', 'wheel', 'full', 'force', 'blue', 'object', 'decide', 'surface',
  'deep', 'moon', 'island', 'foot', 'busy', 'test', 'record', 'boat',
  'common', 'gold', 'possible', 'plane', 'dry', 'wonder', 'laugh', 'thousand',
  'ago', 'ran', 'check', 'game', 'shape', 'hot', 'miss', 'brought', 'heat',
  'snow', 'bring', 'yes', 'distant', 'fill', 'east', 'paint', 'language',
  'among', 'sleep', 'live', 'write', 'jump', 'climb', 'throw', 'catch',
  'swim', 'dance', 'dream', 'hope', 'wish', 'brave', 'smart', 'funny',
  'happy', 'sad', 'angry', 'calm', 'proud', 'kind', 'gentle', 'strong',
  'quiet', 'loud', 'clean', 'fresh', 'sharp', 'rough', 'smooth', 'thick',
  'thin', 'wide', 'narrow', 'shallow',
];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ============ ROOM MANAGER ============
const rooms = new Map();

function createRoom(roomCode, hostId, hostName, hostEmoji) {
  const room = {
    code: roomCode,
    hostId,
    players: new Map(),
    status: 'waiting',
    text: null,
    timeLimit: 120,
    startTime: null,
    countdown: null,
  };
  room.players.set(hostId, {
    id: hostId,
    name: hostName,
    emoji: hostEmoji,
    progress: 0,
    wpm: 0,
    accuracy: 100,
    finished: false,
    finishTime: null,
    position: null,
  });
  rooms.set(roomCode, room);
  return room;
}

function broadcast(room, message, excludeId = null) {
  const msg = JSON.stringify(message);
  room.players.forEach((player, playerId) => {
    if (playerId === excludeId) return;
    const ws = playerConnections.get(playerId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

function broadcastAll(room, message) {
  broadcast(room, message, null);
}

function getRoomState(room) {
  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    text: room.text,
    timeLimit: room.timeLimit || 120,
    players: Array.from(room.players.values()),
  };
}

const playerConnections = new Map();
const playerRooms = new Map();

// ============ SECURITY HELPERS ============

// Sanitize player name: strip HTML tags & limit length
function sanitizeName(name) {
  if (typeof name !== 'string') return 'Player';
  const cleaned = name.replace(/<[^>]*>/g, '').trim();
  return cleaned.slice(0, 20) || 'Player';
}

// Sanitize custom race text: strip HTML, limit length
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  const cleaned = text.replace(/<[^>]*>/g, '').trim();
  return cleaned.slice(0, 2000);
}

// Sanitize emoji: only allow short strings (emoji are typically 1-4 chars)
function sanitizeEmoji(emoji) {
  if (typeof emoji !== 'string') return '🏎️';
  return emoji.slice(0, 8);
}

// Clean a short text field for feedback (string only, no HTML, limited length)
function cleanField(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
}

// ============ LEADERBOARD HELPERS ============
const LEADERBOARD_DURATION = 60; // only the 1 minute English test counts
const LEADERBOARD_SIZE = 1;      // only 1 winner (the weekly Champion) is shown
const MAX_REALISTIC_WPM = 250;   // anything above this is rejected as fake
const MIN_ACCURACY = 90;         // below this accuracy the score does not count

// Add more words here any time (lowercase, no spaces)
const BLOCKED_WORDS = [
  'fuck', 'shit', 'bitch', 'bastard', 'asshole', 'dick', 'pussy', 'slut', 'nigger',
  'chutiya', 'madarchod', 'behenchod', 'bhosd', 'gandu', 'randi', 'harami', 'saala', 'kutta', 'kamina',
];

// Week starts Monday 00:00 India time (IST). Postgres does the maths for us.
const WEEK_START_SQL = `(date_trunc('week', NOW() AT TIME ZONE 'Asia/Kolkata'))::date`;

// Returns a clean name, or null if the name is not allowed
function cleanLeaderboardName(value) {
  if (typeof value !== 'string') return null;
  const name = value.replace(/\s+/g, ' ').trim();
  if (name.length < 3 || name.length > 15) return null;
  if (!/^[\p{L}\p{N} ]+$/u.test(name)) return null; // letters, numbers, spaces only
  const squashed = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (BLOCKED_WORDS.some((w) => squashed.includes(w))) return null;
  return name;
}

// ============ EXPRESS APP ============
const app = express();

// Railway runs behind one proxy: needed so rate limiting sees the real user IP
app.set('trust proxy', 1);

app.use(cors({
  origin: [
    'https://typehanuman.com',
    'https://www.typehanuman.com',
    'http://localhost:5173',
  ],
}));
app.use(express.json());

// Rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Stricter limiter for the visitor counter (a real user only calls it once)
const visitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for feedback: 3 per minute per IP
const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests. Please wait a minute.' },
});

// Strict limiter for leaderboard submit: 5 per minute per IP
const leaderboardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests. Please wait a minute.' },
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/words', (req, res) => {
  const count = Math.min(Math.max(Number(req.query.count) || 200, 10), 500);
  const words = [];
  const pool = shuffle(WORDS);
  for (let i = 0; i < count; i++) {
    words.push(pool[i % pool.length]);
  }
  res.json({ words });
});

// ============ FEEDBACK -> TELEGRAM ============
const FEEDBACK_CATEGORIES = ['Bug', 'Suggestion', 'Other'];

app.post('/api/feedback', feedbackLimiter, async (req, res) => {
  const body = req.body || {};

  // Honeypot: real users never fill this hidden field. Pretend success to bots.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return res.json({ ok: true });
  }

  const message = cleanField(body.message, 1000);
  if (message.length < 5) {
    return res.status(400).json({ ok: false, error: 'Message is too short.' });
  }

  const category = FEEDBACK_CATEGORIES.includes(body.category) ? body.category : 'Other';
  const contact = cleanField(body.contact, 100);
  const page = cleanField(body.page, 60);
  const device = cleanField(body.device, 30);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('feedback: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set');
    return res.status(503).json({ ok: false, error: 'Feedback is not available right now.' });
  }

  const text = [
    '📩 New feedback from typehanuman',
    '',
    `Category: ${category}`,
    `Page/Mode: ${page || 'unknown'}`,
    `Device: ${device || 'unknown'}`,
    `Contact: ${contact || 'not given'}`,
    '',
    'Message:',
    message,
  ].join('\n');

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!tgRes.ok) {
      const errText = await tgRes.text();
      console.error('feedback telegram error:', tgRes.status, errText);
      return res.status(502).json({ ok: false, error: 'Could not send feedback.' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('feedback error:', err.message);
    res.status(500).json({ ok: false, error: 'Could not send feedback.' });
  }
});

// ============ VISITOR COUNTER ============

// New visitor: +1 and return their visitor number
app.post('/api/visit', visitLimiter, async (_req, res) => {
  if (!pool) return res.status(503).json({ ok: false });
  try {
    const result = await pool.query(
      `UPDATE visitor_counter SET total = total + 1 WHERE id = 1 RETURNING total`
    );
    res.json({ ok: true, number: Number(result.rows[0].total) });
  } catch (err) {
    console.error('visit error:', err.message);
    res.status(500).json({ ok: false });
  }
});

// Current total (does not change the count)
app.get('/api/visitors', async (_req, res) => {
  if (!pool) return res.status(503).json({ ok: false });
  try {
    const result = await pool.query(`SELECT total FROM visitor_counter WHERE id = 1`);
    res.json({ ok: true, total: Number(result.rows[0]?.total || 0) });
  } catch (err) {
    console.error('visitors error:', err.message);
    res.status(500).json({ ok: false });
  }
});

// ============ WEEKLY LEADERBOARD ============

// Current week's winners + time left + past weeks' champions (Hall of Fame)
app.get('/api/leaderboard', async (_req, res) => {
  if (!pool) return res.status(503).json({ ok: false });
  try {
    const info = await pool.query(
      `SELECT ${WEEK_START_SQL}::text AS week_start,
              EXTRACT(EPOCH FROM (
                (date_trunc('week', NOW() AT TIME ZONE 'Asia/Kolkata') + interval '7 days')
                - (NOW() AT TIME ZONE 'Asia/Kolkata')
              ))::int AS seconds_left`
    );

    const top = await pool.query(
      `SELECT name, wpm, accuracy
         FROM weekly_scores
        WHERE week_start = ${WEEK_START_SQL}
        ORDER BY wpm DESC, created_at ASC
        LIMIT ${LEADERBOARD_SIZE}`
    );

    const past = await pool.query(
      `SELECT DISTINCT ON (week_start)
              week_start::text AS week_start, name, wpm, accuracy
         FROM weekly_scores
        WHERE week_start < ${WEEK_START_SQL}
        ORDER BY week_start DESC, wpm DESC, created_at ASC
        LIMIT 10`
    );

    res.json({
      ok: true,
      duration: LEADERBOARD_DURATION,
      weekStart: info.rows[0].week_start,
      secondsLeft: info.rows[0].seconds_left,
      top: top.rows.map((r) => ({
        name: r.name,
        wpm: Number(r.wpm),
        accuracy: Number(r.accuracy),
      })),
      champions: past.rows.map((r) => ({
        weekStart: r.week_start,
        name: r.name,
        wpm: Number(r.wpm),
        accuracy: Number(r.accuracy),
      })),
    });
  } catch (err) {
    console.error('leaderboard error:', err.message);
    res.status(500).json({ ok: false });
  }
});

// Submit a score (only counts if it beats this week's winners)
app.post('/api/leaderboard', leaderboardLimiter, async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, error: 'Leaderboard is not available right now.' });

  const body = req.body || {};

  // Only the 1 minute English test counts
  if (Number(body.duration) !== LEADERBOARD_DURATION) {
    return res.status(400).json({ ok: false, error: 'Only the 1 minute test counts for the leaderboard.' });
  }

  const wpmRaw = Number(body.wpm);
  const accRaw = Number(body.accuracy);
  if (!Number.isFinite(wpmRaw) || !Number.isFinite(accRaw)) {
    return res.status(400).json({ ok: false, error: 'Invalid score.' });
  }
  if (wpmRaw < 1 || wpmRaw > MAX_REALISTIC_WPM) {
    return res.status(400).json({ ok: false, error: 'Invalid score.' });
  }
  if (accRaw < MIN_ACCURACY || accRaw > 100) {
    return res.status(400).json({ ok: false, error: `Accuracy must be at least ${MIN_ACCURACY}% to enter the leaderboard.` });
  }

  const name = cleanLeaderboardName(body.name);
  if (!name) {
    return res.status(400).json({
      ok: false,
      error: 'Name must be 3 to 15 characters: letters, numbers and spaces only, no bad words.',
    });
  }

  const wpm = Math.round(wpmRaw * 10) / 10;
  const accuracy = Math.round(accRaw * 10) / 10;

  try {
    // How many OTHER players already have an equal or better score this week?
    // (earlier score wins a tie, so a tie with the last winner does not get in)
    const better = await pool.query(
      `SELECT COUNT(*)::int AS c
         FROM weekly_scores
        WHERE week_start = ${WEEK_START_SQL}
          AND wpm >= $1
          AND lower(name) <> lower($2)`,
      [wpm, name]
    );
    if (better.rows[0].c >= LEADERBOARD_SIZE) {
      return res.json({ ok: false, error: "Score did not beat this week's Champion." });
    }

    // Insert, or improve this name's score for the week (never lowers it)
    const saved = await pool.query(
      `INSERT INTO weekly_scores (week_start, name, wpm, accuracy)
       VALUES (${WEEK_START_SQL}, $1, $2, $3)
       ON CONFLICT (week_start, lower(name))
       DO UPDATE SET name = EXCLUDED.name,
                     wpm = EXCLUDED.wpm,
                     accuracy = EXCLUDED.accuracy,
                     created_at = NOW()
       WHERE EXCLUDED.wpm > weekly_scores.wpm`,
      [name, wpm, accuracy]
    );

    // Find the final rank of this name (based on the best score saved)
    const mine = await pool.query(
      `SELECT wpm, created_at FROM weekly_scores
        WHERE week_start = ${WEEK_START_SQL} AND lower(name) = lower($1)`,
      [name]
    );
    const bestWpm = Number(mine.rows[0].wpm);
    const myTime = mine.rows[0].created_at;
    const rankRes = await pool.query(
      `SELECT COUNT(*)::int AS c
         FROM weekly_scores
        WHERE week_start = ${WEEK_START_SQL}
          AND (wpm > $1 OR (wpm = $1 AND created_at < $2))`,
      [bestWpm, myTime]
    );
    const rank = rankRes.rows[0].c + 1;

    res.json({ ok: true, rank, isChampion: rank === 1, wpm: bestWpm, improved: saved.rowCount > 0 });
  } catch (err) {
    console.error('leaderboard submit error:', err.message);
    res.status(500).json({ ok: false, error: 'Could not save score.' });
  }
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// ============ HTTP + WS SERVER ============
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  let myPlayerId = null;
  let myRoomCode = null;

  // Basic per-connection message rate limiting
  let messageCount = 0;
  let messageWindowStart = Date.now();
  const MAX_MESSAGES_PER_WINDOW = 120; // ~2 per second average
  const WINDOW_MS = 10000;

  ws.on('message', (data) => {
    // Rate limit check
    const now = Date.now();
    if (now - messageWindowStart > WINDOW_MS) {
      messageWindowStart = now;
      messageCount = 0;
    }
    messageCount++;
    if (messageCount > MAX_MESSAGES_PER_WINDOW) {
      return; // silently drop excess messages
    }

    let msg;
    try { msg = JSON.parse(data); } catch { return; }
    if (!msg || typeof msg.type !== 'string') return;

    // ── CREATE ROOM ──
    if (msg.type === 'create_room') {
      const { playerId, playerName, playerEmoji } = msg;
      if (typeof playerId !== 'string' || !playerId) return;
      myPlayerId = playerId;

      let code;
      do { code = Math.random().toString(36).substring(2, 8).toUpperCase(); }
      while (rooms.has(code));

      myRoomCode = code;
      playerConnections.set(playerId, ws);
      playerRooms.set(playerId, code);

      const room = createRoom(code, playerId, sanitizeName(playerName), sanitizeEmoji(playerEmoji));

      ws.send(JSON.stringify({
        type: 'room_created',
        roomCode: code,
        state: getRoomState(room),
      }));
    }

    // ── JOIN ROOM ──
    else if (msg.type === 'join_room') {
      const { playerId, playerName, playerEmoji, roomCode } = msg;
      if (typeof playerId !== 'string' || !playerId) return;
      if (typeof roomCode !== 'string' || !roomCode) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid room code!' }));
        return;
      }
      myPlayerId = playerId;
      myRoomCode = roomCode;

      const room = rooms.get(roomCode);
      if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found!' }));
        return;
      }
      if (room.status !== 'waiting') {
        ws.send(JSON.stringify({ type: 'error', message: 'Race already started!' }));
        return;
      }
      if (room.players.size >= 5) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room is full! Max 5 players.' }));
        return;
      }

      playerConnections.set(playerId, ws);
      playerRooms.set(playerId, roomCode);

      room.players.set(playerId, {
        id: playerId,
        name: sanitizeName(playerName),
        emoji: sanitizeEmoji(playerEmoji),
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
        finishTime: null,
        position: null,
      });

      ws.send(JSON.stringify({
        type: 'room_joined',
        state: getRoomState(room),
      }));

      broadcast(room, {
        type: 'player_joined',
        player: room.players.get(playerId),
        state: getRoomState(room),
      }, playerId);
    }

    // ── START RACE (host only) ──
    else if (msg.type === 'start_race') {
      const room = rooms.get(myRoomCode);
      if (!room || room.hostId !== myPlayerId) return;
      if (room.players.size < 2) {
        ws.send(JSON.stringify({ type: 'error', message: 'Need at least 2 players!' }));
        return;
      }

      const customText = sanitizeText(msg.text);
      const raceText = customText || shuffle(WORDS).slice(0, 80).join(' ');
      room.text = raceText;

      // Clamp timeLimit between 30s and 30min
      let tl = Number(msg.timeLimit) || 120;
      tl = Math.min(Math.max(tl, 30), 1800);
      room.timeLimit = tl;

      room.status = 'countdown';

      broadcastAll(room, {
        type: 'race_starting',
        text: raceText,
        timeLimit: room.timeLimit,
        countdown: 5,
      });

      let count = 5;
      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          broadcastAll(room, { type: 'countdown', count });
        } else {
          clearInterval(interval);
          room.status = 'racing';
          room.startTime = Date.now();
          broadcastAll(room, { type: 'race_started', startTime: room.startTime });
        }
      }, 1000);
    }

    // ── PROGRESS UPDATE ──
    else if (msg.type === 'progress_update') {
      const room = rooms.get(myRoomCode);
      if (!room || room.status !== 'racing') return;

      const player = room.players.get(myPlayerId);
      if (!player || player.finished) return;

      const progress = Math.min(Math.max(Number(msg.progress) || 0, 0), 100);
      const wpm = Math.min(Math.max(Number(msg.wpm) || 0, 0), 500);
      const accuracy = Math.min(Math.max(Number(msg.accuracy) || 0, 0), 100);

      player.progress = progress;
      player.wpm = wpm;
      player.accuracy = accuracy;

      broadcast(room, {
        type: 'player_progress',
        playerId: myPlayerId,
        progress,
        wpm,
        accuracy,
      }, myPlayerId);
    }

    // ── PLAYER FINISHED ──
    else if (msg.type === 'player_finished') {
      const room = rooms.get(myRoomCode);
      if (!room || room.status !== 'racing') return;

      const player = room.players.get(myPlayerId);
      if (!player || player.finished) return;

      const finishedCount = Array.from(room.players.values()).filter(p => p.finished).length;
      player.finished = true;
      player.finishTime = Date.now() - room.startTime;
      player.position = finishedCount + 1;
      player.wpm = Math.min(Math.max(Number(msg.wpm) || 0, 0), 500);
      player.accuracy = Math.min(Math.max(Number(msg.accuracy) || 0, 0), 100);
      player.progress = 100;

      broadcastAll(room, {
        type: 'player_finished',
        playerId: myPlayerId,
        position: player.position,
        wpm: player.wpm,
        accuracy: player.accuracy,
        finishTime: player.finishTime,
        state: getRoomState(room),
      });

      const allFinished = Array.from(room.players.values()).every(p => p.finished);
      if (allFinished) {
        room.status = 'finished';
        broadcastAll(room, {
          type: 'race_finished',
          state: getRoomState(room),
        });
      }
    }

    // ── LEAVE ROOM ──
    else if (msg.type === 'leave_room') {
      handleDisconnect();
    }
  });

  function handleDisconnect() {
    if (!myPlayerId || !myRoomCode) return;
    const room = rooms.get(myRoomCode);
    if (room) {
      room.players.delete(myPlayerId);
      broadcast(room, {
        type: 'player_left',
        playerId: myPlayerId,
        state: getRoomState(room),
      });
      if (room.players.size === 0) {
        rooms.delete(myRoomCode);
      } else if (room.hostId === myPlayerId) {
        const newHost = room.players.keys().next().value;
        room.hostId = newHost;
        broadcastAll(room, {
          type: 'host_changed',
          newHostId: newHost,
          state: getRoomState(room),
        });
      }
    }
    playerConnections.delete(myPlayerId);
    playerRooms.delete(myPlayerId);
  }

  ws.on('close', handleDisconnect);
  ws.on('error', handleDisconnect);
});

server.listen(PORT, () => {
  console.log(`TypeHanuman server running on http://localhost:${PORT}`);
});