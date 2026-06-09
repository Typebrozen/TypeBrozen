# TypeExpress

A minimal typing speed test with React, Vite, Tailwind CSS, and a Node.js backend.

## Features

- 60-second timed test with random words
- Live WPM and accuracy counters
- Dark theme UI with Roboto Mono
- Mobile responsive layout

## Setup

```bash
# Install dependencies (from project root)
npm install
npm install --prefix client
npm install --prefix server

# Run both frontend and backend
npm run dev
```

Or run separately:

```bash
npm run dev:server   # http://localhost:3001
npm run dev:client   # http://localhost:5173
```

Open **http://localhost:5173** during development. The Vite dev server proxies `/api` requests to the backend.

## Production

```bash
npm run build
npm start
```

The server serves the built client from `client/dist` on port 3001.

## How to type

1. Click the word area or start typing to begin the timer.
2. Type each word and press **Space** to move to the next word.
3. Stats update live until the 60-second timer ends.
