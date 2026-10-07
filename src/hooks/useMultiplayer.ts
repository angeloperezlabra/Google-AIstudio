import { useState, useEffect, useRef, useCallback } from 'react';

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  placedStickerIds: string[];
  streak: number;
}

export interface SharedPlacement {
  stickerId: string;
  placedBy: string;
  placedByName: string;
  timestamp: number;
}

export interface RoomState {
  id: string;
  mode: 'competitive' | 'collaborative';
  players: MultiplayerPlayer[];
  sharedPlacements: Record<string, SharedPlacement>;
  timerDuration: number;
  timerStartedAt: number | null;
  timeRemaining: number;
  isGameActive: boolean;
  isGameFinished: boolean;
}

export interface QuickReaction {
  id: string;
  playerId: string;
  playerName: string;
  emoji: string;
  text: string;
  timestamp: number;
}

export function useMultiplayer() {
  const [isConnected, setIsConnected] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [playerId, setPlayerId] = useState<string>('');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [reactions, setReactions] = useState<QuickReaction[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const connectSocket = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === 'joined_success') {
            setPlayerId(msg.playerId);
            setRoom(msg.room);
            setIsInRoom(true);
          } else if (msg.type === 'player_joined') {
            setRoom(msg.room);
          } else if (msg.type === 'game_started') {
            setRoom(msg.room);
          } else if (msg.type === 'timer_tick') {
            setRoom(prev => prev ? { ...prev, timeRemaining: msg.timeRemaining } : null);
          } else if (msg.type === 'sticker_placed') {
            setRoom(msg.room);
          } else if (msg.type === 'game_over') {
            setRoom(msg.room);
          } else if (msg.type === 'game_reset') {
            setRoom(msg.room);
          } else if (msg.type === 'reaction_received') {
            const newReaction: QuickReaction = {
              id: Math.random().toString(),
              playerId: msg.playerId,
              playerName: msg.playerName,
              emoji: msg.emoji,
              text: msg.text,
              timestamp: Date.now(),
            };
            setReactions(prev => [newReaction, ...prev.slice(0, 9)]);
          } else if (msg.type === 'player_disconnected') {
            // Updated in room
          }
        } catch (e) {
          console.error('Error handling WS message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 3 seconds if was in room
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSocket();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setConnectionError('No se pudo conectar al servidor multijugador.');
      };

      socketRef.current = ws;
    } catch (e) {
      console.error('WebSocket connection error:', e);
      setConnectionError('Error al iniciar WebSockets.');
    }
  }, []);

  useEffect(() => {
    connectSocket();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectSocket]);

  const joinRoom = useCallback((roomId: string, playerName: string, playerAvatar: string, mode: 'competitive' | 'collaborative') => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      connectSocket();
    }
    const send = () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'join_room',
          roomId,
          playerName,
          playerAvatar,
          mode,
          playerId: playerId || undefined,
        }));
      }
    };

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      send();
    } else {
      setTimeout(send, 400);
    }
  }, [connectSocket, playerId]);

  const startGame = useCallback((duration: number = 180, reset: boolean = true) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'start_game',
        duration,
        reset,
      }));
    }
  }, []);

  const placeStickerMultiplayer = useCallback((stickerId: string, points: number, isCorrect: boolean) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'place_sticker',
        stickerId,
        points,
        isCorrect,
      }));
    }
  }, []);

  const sendReaction = useCallback((emoji: string, text: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'quick_reaction',
        emoji,
        text,
      }));
    }
  }, []);

  const resetGame = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'reset_game',
      }));
    }
  }, []);

  const leaveRoom = useCallback(() => {
    setIsInRoom(false);
    setRoom(null);
  }, []);

  return {
    isConnected,
    isInRoom,
    playerId,
    room,
    reactions,
    connectionError,
    joinRoom,
    startGame,
    placeStickerMultiplayer,
    sendReaction,
    resetGame,
    leaveRoom,
  };
}
