import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

export default function useMultiplayer() {
  const [myId, setMyId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [raceText, setRaceText] = useState('');
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to server - change port if your server runs on different port
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server, ID:', socketRef.current.id);
      setConnected(true);
      setMyId(socketRef.current.id);
      setError(null);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
      setError('Disconnected from server');
    });

    socketRef.current.on('room-update', (room) => {
      console.log('Room update received:', room);
      setRoomState(room);
    });

    socketRef.current.on('room-error', (msg) => {
      console.log('Room error:', msg);
      setError(msg);
      setTimeout(() => setError(null), 3000);
    });

    socketRef.current.on('race-countdown', (count) => {
      console.log('Countdown:', count);
      setCountdown(count);
      if (count === 0) {
        setRaceStarted(true);
        setCountdown(null);
      }
    });

    socketRef.current.on('race-start', (text) => {
      console.log('Race starting with text length:', text?.length);
      setRaceText(text);
      setRaceStarted(true);
    });

    socketRef.current.on('race-finished', () => {
      console.log('Race finished');
      setRaceFinished(true);
    });

    socketRef.current.on('race-reset', () => {
      console.log('Race reset');
      setRaceStarted(false);
      setRaceFinished(false);
      setCountdown(null);
      setRaceText('');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const createRoom = useCallback((playerName, playerEmoji) => {
    if (!playerName?.trim()) {
      setError('Please enter your name');
      return;
    }
    console.log('Creating room for:', playerName, playerEmoji);
    socketRef.current?.emit('create-room', { playerName, playerEmoji });
  }, []);

  const joinRoom = useCallback((roomCode, playerName, playerEmoji) => {
    if (!roomCode?.trim() || !playerName?.trim()) {
      setError('Room code and name are required');
      return;
    }
    console.log('Joining room:', roomCode, playerName, playerEmoji);
    socketRef.current?.emit('join-room', { 
      roomCode: roomCode.toUpperCase().trim(), 
      playerName: playerName.trim(), 
      playerEmoji 
    });
  }, []);

  const startRace = useCallback((text) => {
    console.log('Starting race with text');
    socketRef.current?.emit('start-race', { text });
  }, []);

  const sendProgress = useCallback((progress, wpm, accuracy) => {
    socketRef.current?.emit('race-progress', { progress, wpm, accuracy });
  }, []);

  const sendFinished = useCallback((finalWpm, finalAccuracy, timeTaken) => {
    socketRef.current?.emit('race-finished', { finalWpm, finalAccuracy, timeTaken });
  }, []);

  const leaveRoom = useCallback(() => {
    console.log('Leaving room');
    socketRef.current?.emit('leave-room');
    setRoomState(null);
    setRaceStarted(false);
    setRaceFinished(false);
    setCountdown(null);
    setRaceText('');
  }, []);

  const resetRace = useCallback(() => {
    setCountdown(null);
    setRaceText('');
    setRaceStarted(false);
    setRaceFinished(false);
  }, []);

  return {
    myId,
    connected,
    roomState,
    error,
    countdown,
    raceText,
    raceStarted,
    raceFinished,
    createRoom,
    joinRoom,
    startRace,
    sendProgress,
    sendFinished,
    leaveRoom,
    resetRace,
  };
}