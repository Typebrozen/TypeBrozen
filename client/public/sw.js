const CACHE_NAME = 'typehanuman-v3';

// Files jo offline cache honge
const OFFLINE_FILES = [
  '/',
  '/index.html',
];

// Install — cache basic files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_FILES);
    })
  );
  self.skipWaiting();
});

// Activate — purana cache delete karo
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // WebSocket skip karo (multiplayer)
  if (event.request.url.startsWith('ws://') ||
      event.request.url.startsWith('wss://')) {
    return;
  }

  // API calls — network only (multiplayer words)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Offline hone pe words ka fallback
        if (url.pathname === '/api/words') {
          const fallbackWords = [
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
            'hand', 'part', 'place', 'case', 'week', 'system', 'program', 'question',
            'right', 'study', 'book', 'eye', 'job', 'word', 'great', 'where', 'help',
            'through', 'much', 'before', 'line', 'too', 'old', 'tell', 'very', 'man',
            'thing', 'name', 'small', 'every', 'found', 'still', 'between', 'should',
            'home', 'big', 'air', 'set', 'own', 'under', 'read', 'last', 'never',
            'left', 'end', 'why', 'turn', 'here', 'show', 'form', 'cause', 'mean',
            'move', 'same', 'does', 'three', 'play', 'put', 'large', 'add', 'land',
            'must', 'high', 'such', 'follow', 'act', 'ask', 'men', 'change', 'went',
            'light', 'kind', 'off', 'need', 'house', 'picture', 'try', 'again',
            'animal', 'point', 'mother', 'near', 'build', 'self', 'earth', 'father',
            'head', 'stand', 'page', 'country', 'answer', 'school', 'grow', 'learn',
            'plant', 'food', 'sun', 'four', 'keep', 'let', 'thought', 'city', 'tree',
            'farm', 'hard', 'start', 'might', 'story', 'far', 'sea', 'draw', 'late',
            'run', 'close', 'night', 'real', 'few', 'open', 'seem', 'together', 'next',
            'white', 'begin', 'got', 'walk', 'paper', 'group', 'always', 'music',
            'those', 'both', 'often', 'letter', 'river', 'car', 'feet', 'care',
            'second', 'carry', 'took', 'science', 'eat', 'room', 'friend', 'idea',
            'fish', 'mountain', 'stop', 'once', 'hear', 'sure', 'watch', 'color',
            'face', 'wood', 'main', 'plain', 'girl', 'young', 'ready', 'above', 'ever',
            'red', 'list', 'feel', 'talk', 'bird', 'soon', 'body', 'dog', 'family',
            'door', 'product', 'black', 'short', 'class', 'wind', 'happen', 'complete',
            'ship', 'area', 'half', 'rock', 'order', 'fire', 'south', 'problem',
            'piece', 'told', 'knew', 'pass', 'since', 'top', 'whole', 'king', 'space',
            'heard', 'best', 'hour', 'better', 'true', 'five', 'remember', 'step',
            'early', 'hold', 'ground', 'reach', 'fast', 'sing', 'listen', 'table',
            'travel', 'morning', 'simple', 'toward', 'love', 'person', 'money', 'road',
            'rain', 'pull', 'cold', 'voice', 'power', 'town', 'certain', 'fly', 'fall',
            'dark', 'note', 'wait', 'plan', 'star', 'field', 'done', 'drive', 'front',
            'teach', 'green', 'quick', 'ocean', 'warm', 'free', 'minute', 'strong',
            'mind', 'clear', 'produce', 'fact', 'street', 'nothing', 'stay', 'full',
            'blue', 'deep', 'moon', 'island', 'busy', 'test', 'record', 'boat', 'gold',
            'possible', 'dry', 'wonder', 'laugh', 'ago', 'check', 'game', 'shape',
            'snow', 'bring', 'sleep', 'live', 'write', 'jump', 'dream', 'hope', 'wish',
            'brave', 'smart', 'happy', 'sad', 'calm', 'proud', 'kind', 'gentle',
            'quiet', 'loud', 'clean', 'fresh', 'sharp', 'smooth', 'wide', 'narrow',
          ];
          for (let i = fallbackWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [fallbackWords[i], fallbackWords[j]] = [fallbackWords[j], fallbackWords[i]];
          }
          return new Response(JSON.stringify({ words: fallbackWords }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  // HTML pages (jaise index.html) — HAMESHA pehle network se fetch karo,
  // taaki naye deploy ke baad turant naya version mile, purana JS
  // reference karta hua stale HTML kabhi na dikhe. Offline hone par
  // hi cache se dikhao.
  const isNavigationRequest =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');

  if (isNavigationRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Baaki files (JS, CSS, images, fonts — jinke naam unique/hashed hote
  // hain) — cache first theek hai, kyunki inka content kabhi nahi
  // badalta ek baar ban jaane ke baad.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        return caches.match('/') || caches.match('/index.html');
      });
    })
  );
});