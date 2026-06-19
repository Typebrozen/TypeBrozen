import { useCallback, useEffect, useRef, useState } from 'react';

function generateId() {
  return Math.random().toString(36).substring(2, 12);
}

export default function useMultiplayer() {
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [raceText, setRaceText] = useState('');
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [timeLimit, setTimeLimit] = useState(120);
  const [myId] = useState(() => generateId());

  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  const send = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = import.meta.env.DEV ? '3001' : window.location.port;
    const wsUrl = port ? `${protocol}//${host}:${port}` : `${protocol}//${host}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      setError('Connection failed. Retrying...');
    };

    ws.onmessage = (event) => {
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }

      switch (msg.type) {
        case 'room_created':
        case 'room_joined':
          setRoomState(msg.state);
          setError(null);
          break;

        case 'player_joined':
        case 'player_left':
        case 'host_changed':
          setRoomState(msg.state);
          break;

        case 'race_starting':
          setRaceText(msg.text);
          setCountdown(msg.countdown);
          setTimeLimit(msg.timeLimit || 120);
          setRaceStarted(false);
          setRaceFinished(false);
          break;

        case 'countdown':
          setCountdown(msg.count);
          break;

        case 'race_started':
          setCountdown(0);
          setRaceStarted(true);
          break;

        case 'player_progress':
          setRoomState(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              players: prev.players.map(p =>
                p.id === msg.playerId
                  ? { ...p, progress: msg.progress, wpm: msg.wpm, accuracy: msg.accuracy }
                  : p
              ),
            };
          });
          break;

        case 'player_finished':
          setRoomState(msg.state);
          break;

        case 'race_finished':
          setRoomState(msg.state);
          setRaceFinished(true);
          break;

        case 'error':
          setError(msg.message);
          setTimeout(() => setError(null), 3000);
          break;

        default:
          break;
      }
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const createRoom = useCallback((playerName, playerEmoji) => {
    if (!playerName?.trim()) { setError('Please enter your name'); return; }
    send({ type: 'create_room', playerId: myId, playerName: playerName.trim(), playerEmoji });
  }, [send, myId]);

  const joinRoom = useCallback((roomCode, playerName, playerEmoji) => {
    if (!roomCode?.trim() || !playerName?.trim()) { setError('Room code and name are required'); return; }
    send({ type: 'join_room', playerId: myId, playerName: playerName.trim(), playerEmoji, roomCode: roomCode.toUpperCase() });
  }, [send, myId]);

  const startRace = useCallback((text, timeLimitSeconds = 120) => {
    send({ type: 'start_race', text, timeLimit: timeLimitSeconds });
  }, [send]);

  const sendProgress = useCallback((progress, wpm, accuracy) => {
    send({ type: 'progress_update', progress, wpm, accuracy });
  }, [send]);

  const sendFinished = useCallback((wpm, accuracy) => {
    send({ type: 'player_finished', wpm, accuracy });
  }, [send]);

  const leaveRoom = useCallback(() => {
    send({ type: 'leave_room' });
    setRoomState(null);
    setRaceText('');
    setRaceStarted(false);
    setRaceFinished(false);
    setCountdown(null);
    // Clear URL params
    window.history.replaceState({}, '', '/');
  }, [send]);

  const resetRace = useCallback(() => {
    setRaceStarted(false);
    setRaceFinished(false);
    setCountdown(null);
    setRaceText('');
  }, []);

  return {
    myId, connected, roomState, error,
    countdown, raceText, raceStarted, raceFinished, timeLimit,
    createRoom, joinRoom, startRace,
    sendProgress, sendFinished, leaveRoom, resetRace,
  };
}