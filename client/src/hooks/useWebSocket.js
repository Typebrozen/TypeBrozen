import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export default function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [error, setError] = useState(null);
  const [raceStarted, setRaceStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [raceStartTime, setRaceStartTime] = useState(null);
  const [raceText, setRaceText] = useState(null);
  const [players, setPlayers] = useState([]);
  
  const wsRef = useRef(null);
  const playerIdRef = useRef(null);
  const roomCodeRef = useRef(null);
  const callbacksRef = useRef({});

  const connect = useCallback(() => {
    wsRef.current = new WebSocket(WS_URL);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received:', data.type, data);
        
        switch (data.type) {
          case 'room_created':
            roomCodeRef.current = data.roomCode;
            setRoomState(data.state);
            if (callbacksRef.current.onRoomCreated) {
              callbacksRef.current.onRoomCreated(data.roomCode);
            }
            break;
            
          case 'room_joined':
            setRoomState(data.state);
            setPlayers(data.state.players);
            if (callbacksRef.current.onRoomJoined) {
              callbacksRef.current.onRoomJoined(data.state);
            }
            break;
            
          case 'player_joined':
            setRoomState(data.state);
            setPlayers(data.state.players);
            break;
            
          case 'player_left':
            setRoomState(data.state);
            setPlayers(data.state.players);
            break;
            
          case 'race_starting':
            setRaceText(data.text);
            setRaceStarted(true);
            // Start countdown
            let count = data.countdown;
            setCountdown(count);
            const interval = setInterval(() => {
              count--;
              if (count > 0) {
                setCountdown(count);
              } else {
                clearInterval(interval);
              }
            }, 1000);
            break;
            
          case 'countdown':
            setCountdown(data.count);
            break;
            
          case 'race_started':
            setRaceStartTime(data.startTime);
            setCountdown(null);
            if (callbacksRef.current.onRaceStart) {
              callbacksRef.current.onRaceStart(data.startTime);
            }
            break;
            
          case 'player_progress':
            setPlayers(prev => prev.map(p => 
              p.id === data.playerId 
                ? { ...p, progress: data.progress, wpm: data.wpm, accuracy: data.accuracy }
                : p
            ));
            if (callbacksRef.current.onProgress) {
              callbacksRef.current.onProgress(data);
            }
            break;
            
          case 'player_finished':
            setPlayers(prev => prev.map(p => 
              p.id === data.playerId 
                ? { ...p, finished: true, position: data.position, wpm: data.wpm, accuracy: data.accuracy }
                : p
            ));
            break;
            
          case 'race_finished':
            setRaceStarted(false);
            if (callbacksRef.current.onRaceFinish) {
              callbacksRef.current.onRaceFinish(data.state);
            }
            break;
            
          case 'error':
            setError(data.message);
            break;
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };
    
    wsRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('Connection error');
    };
    
    wsRef.current.onclose = () => {
      setIsConnected(false);
    };
  }, []);
  
  const createRoom = useCallback((playerName, playerEmoji) => {
    const playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    playerIdRef.current = playerId;
    
    wsRef.current.send(JSON.stringify({
      type: 'create_room',
      playerId,
      playerName,
      playerEmoji,
    }));
  }, []);
  
  const joinRoom = useCallback((roomCode, playerName, playerEmoji) => {
    const playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    playerIdRef.current = playerId;
    roomCodeRef.current = roomCode;
    
    wsRef.current.send(JSON.stringify({
      type: 'join_room',
      playerId,
      playerName,
      playerEmoji,
      roomCode,
    }));
  }, []);
  
  const startRace = useCallback((text) => {
    wsRef.current.send(JSON.stringify({
      type: 'start_race',
      text,
    }));
  }, []);
  
  const updateProgress = useCallback((progress, wpm, accuracy) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'progress_update',
      progress,
      wpm,
      accuracy,
    }));
  }, []);
  
  const finishRace = useCallback((wpm, accuracy) => {
    wsRef.current.send(JSON.stringify({
      type: 'player_finished',
      wpm,
      accuracy,
    }));
  }, []);
  
  const leaveRoom = useCallback(() => {
    wsRef.current.send(JSON.stringify({ type: 'leave_room' }));
  }, []);
  
  const setCallbacks = useCallback((callbacks) => {
    callbacksRef.current = { ...callbacksRef.current, ...callbacks };
  }, []);
  
  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);
  
  return {
    isConnected,
    error,
    roomState,
    players,
    raceStarted,
    countdown,
    raceStartTime,
    raceText,
    createRoom,
    joinRoom,
    startRace,
    updateProgress,
    finishRace,
    leaveRoom,
    setCallbacks,
  };
}