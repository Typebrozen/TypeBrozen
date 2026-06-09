import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

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
    status: 'waiting', // waiting | countdown | racing | finished
    text: null,
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
    players: Array.from(room.players.values()),
  };
}

// playerId -> WebSocket connection
const playerConnections = new Map();
// playerId -> roomCode
const playerRooms = new Map();

// ============ EXPRESS APP ============
const app = express();
app.use(cors());
app.use(express.json());

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

  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }

    // ── CREATE ROOM ──
    if (msg.type === 'create_room') {
      const { playerId, playerName, playerEmoji } = msg;
      myPlayerId = playerId;

      // Generate unique room code
      let code;
      do { code = Math.random().toString(36).substring(2, 8).toUpperCase(); }
      while (rooms.has(code));

      myRoomCode = code;
      playerConnections.set(playerId, ws);
      playerRooms.set(playerId, code);

      const room = createRoom(code, playerId, playerName, playerEmoji);

      ws.send(JSON.stringify({
        type: 'room_created',
        roomCode: code,
        state: getRoomState(room),
      }));
    }

    // ── JOIN ROOM ──
    else if (msg.type === 'join_room') {
      const { playerId, playerName, playerEmoji, roomCode } = msg;
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
      if (room.players.size >= 8) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room is full! Max 8 players.' }));
        return;
      }

      playerConnections.set(playerId, ws);
      playerRooms.set(playerId, roomCode);

      room.players.set(playerId, {
        id: playerId,
        name: playerName,
        emoji: playerEmoji,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
        finishTime: null,
        position: null,
      });

      // Tell new player current state
      ws.send(JSON.stringify({
        type: 'room_joined',
        state: getRoomState(room),
      }));

      // Tell everyone else
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

      // Pick race text
      const raceText = msg.text || shuffle(WORDS).slice(0, 80).join(' ');
      room.text = raceText;
      room.status = 'countdown';

      broadcastAll(room, {
        type: 'race_starting',
        text: raceText,
        countdown: 5,
      });

      // 5 second countdown
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

      player.progress = msg.progress;
      player.wpm = msg.wpm;
      player.accuracy = msg.accuracy;

      broadcast(room, {
        type: 'player_progress',
        playerId: myPlayerId,
        progress: msg.progress,
        wpm: msg.wpm,
        accuracy: msg.accuracy,
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
      player.wpm = msg.wpm;
      player.accuracy = msg.accuracy;
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

      // All finished?
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
        // Transfer host to next player
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