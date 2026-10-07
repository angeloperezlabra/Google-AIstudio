import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  placedStickerIds: string[];
  streak: number;
  ws?: WebSocket;
}

interface SharedPlacement {
  stickerId: string;
  placedBy: string;
  placedByName: string;
  timestamp: number;
}

interface Room {
  id: string;
  mode: 'competitive' | 'collaborative';
  players: Player[];
  sharedPlacements: Record<string, SharedPlacement>;
  timerDuration: number; // in seconds, default 180 (3 min)
  timerStartedAt: number | null;
  timerInterval?: NodeJS.Timeout;
  timeRemaining: number;
  isGameActive: boolean;
  isGameFinished: boolean;
}

const rooms = new Map<string, Room>();

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // API health check and list rooms status
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', activeRooms: rooms.size });
  });

  function getCleanRoomState(room: Room) {
    return {
      id: room.id,
      mode: room.mode,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        placedStickerIds: p.placedStickerIds,
        streak: p.streak,
      })),
      sharedPlacements: room.sharedPlacements,
      timerDuration: room.timerDuration,
      timerStartedAt: room.timerStartedAt,
      timeRemaining: room.timeRemaining,
      isGameActive: room.isGameActive,
      isGameFinished: room.isGameFinished,
    };
  }

  function broadcastToRoom(room: Room, message: Record<string, unknown>, excludeWs?: WebSocket) {
    const payload = JSON.stringify(message);
    room.players.forEach(p => {
      if (p.ws && p.ws.readyState === WebSocket.OPEN && p.ws !== excludeWs) {
        p.ws.send(payload);
      }
    });
  }

  function stopRoomTimer(room: Room) {
    if (room.timerInterval) {
      clearInterval(room.timerInterval);
      room.timerInterval = undefined;
    }
  }

  function startRoomTimer(room: Room) {
    stopRoomTimer(room);
    room.isGameActive = true;
    room.isGameFinished = false;
    room.timerStartedAt = Date.now();

    room.timerInterval = setInterval(() => {
      if (room.timeRemaining > 0) {
        room.timeRemaining -= 1;
        broadcastToRoom(room, {
          type: 'timer_tick',
          timeRemaining: room.timeRemaining,
        });
      } else {
        stopRoomTimer(room);
        room.isGameActive = false;
        room.isGameFinished = true;
        broadcastToRoom(room, {
          type: 'game_over',
          room: getCleanRoomState(room),
        });
      }
    }, 1000);
  }

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomId: string | null = null;
    let currentPlayerId: string | null = null;

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        const { type } = data;

        if (type === 'join_room') {
          const roomIdStr = String(data.roomId || 'SALA-1').toUpperCase().trim();
          const playerIdStr = String(data.playerId || `p-${Math.random().toString(36).substring(2, 9)}`);
          currentRoomId = roomIdStr;
          currentPlayerId = playerIdStr;

          let room = rooms.get(roomIdStr);
          if (!room) {
            room = {
              id: roomIdStr,
              mode: data.mode || 'competitive',
              players: [],
              sharedPlacements: {},
              timerDuration: 180,
              timerStartedAt: null,
              timeRemaining: 180,
              isGameActive: false,
              isGameFinished: false,
            };
            rooms.set(roomIdStr, room);
          }

          // Check if player already in room (reconnect)
          let existingPlayer = room.players.find(p => p.id === playerIdStr);
          if (existingPlayer) {
            existingPlayer.ws = ws;
            existingPlayer.name = data.playerName || existingPlayer.name;
            existingPlayer.avatar = data.playerAvatar || existingPlayer.avatar;
          } else {
            existingPlayer = {
              id: playerIdStr,
              name: data.playerName || `Estudiante ${room.players.length + 1}`,
              avatar: data.playerAvatar || '🎓',
              score: 0,
              placedStickerIds: [],
              streak: 0,
              ws,
            };
            room.players.push(existingPlayer);
          }

          ws.send(JSON.stringify({
            type: 'joined_success',
            playerId: playerIdStr,
            room: getCleanRoomState(room),
          }));

          broadcastToRoom(room, {
            type: 'player_joined',
            player: {
              id: existingPlayer.id,
              name: existingPlayer.name,
              avatar: existingPlayer.avatar,
              score: existingPlayer.score,
              streak: existingPlayer.streak,
            },
            room: getCleanRoomState(room),
          }, ws);
        }

        if (type === 'start_game') {
          if (!currentRoomId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const duration = data.duration || 180;
          room.timerDuration = duration;
          room.timeRemaining = duration;
          // reset player scores if starting fresh game
          if (data.reset) {
            room.players.forEach(p => {
              p.score = 0;
              p.placedStickerIds = [];
              p.streak = 0;
            });
            room.sharedPlacements = {};
          }

          startRoomTimer(room);

          broadcastToRoom(room, {
            type: 'game_started',
            room: getCleanRoomState(room),
          });
        }

        if (type === 'place_sticker') {
          if (!currentRoomId || !currentPlayerId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const { stickerId, points = 100, isCorrect } = data;
          const player = room.players.find(p => p.id === currentPlayerId);
          if (!player) return;

          if (isCorrect) {
            if (!player.placedStickerIds.includes(stickerId)) {
              player.placedStickerIds.push(stickerId);
            }
            player.streak = (player.streak || 0) + 1;
            player.score += points;

            if (room.mode === 'collaborative') {
              room.sharedPlacements[stickerId] = {
                stickerId,
                placedBy: player.id,
                placedByName: player.name,
                timestamp: Date.now(),
              };
            }

            broadcastToRoom(room, {
              type: 'sticker_placed',
              playerId: player.id,
              playerName: player.name,
              stickerId,
              points,
              streak: player.streak,
              room: getCleanRoomState(room),
            });
          } else {
            player.streak = 0;
            if (player.score >= 10) {
              player.score -= 10;
            }
            broadcastToRoom(room, {
              type: 'mismatch_penalty',
              playerId: player.id,
              playerName: player.name,
              score: player.score,
              streak: 0,
            });
          }
        }

        if (type === 'quick_reaction') {
          if (!currentRoomId || !currentPlayerId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;
          const player = room.players.find(p => p.id === currentPlayerId);

          broadcastToRoom(room, {
            type: 'reaction_received',
            playerId: currentPlayerId,
            playerName: player?.name || 'Estudiante',
            emoji: data.emoji,
            text: data.text,
          });
        }

        if (type === 'reset_game') {
          if (!currentRoomId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          stopRoomTimer(room);
          room.timeRemaining = room.timerDuration;
          room.isGameActive = false;
          room.isGameFinished = false;
          room.sharedPlacements = {};
          room.players.forEach(p => {
            p.score = 0;
            p.placedStickerIds = [];
            p.streak = 0;
          });

          broadcastToRoom(room, {
            type: 'game_reset',
            room: getCleanRoomState(room),
          });
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId && currentPlayerId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          const idx = room.players.findIndex(p => p.id === currentPlayerId);
          if (idx !== -1) {
            const leftPlayer = room.players[idx];
            // If connection closed, mark ws disconnected
            leftPlayer.ws = undefined;
            // Notify other players
            broadcastToRoom(room, {
              type: 'player_disconnected',
              playerId: currentPlayerId,
              playerName: leftPlayer.name,
            });
          }

          // Clean up empty room after 10 minutes if no active sockets
          const hasActive = room.players.some(p => p.ws && p.ws.readyState === WebSocket.OPEN);
          if (!hasActive) {
            stopRoomTimer(room);
            setTimeout(() => {
              const stillHasActive = room.players.some(p => p.ws && p.ws.readyState === WebSocket.OPEN);
              if (!stillHasActive) {
                rooms.delete(currentRoomId!);
              }
            }, 600000);
          }
        }
      }
    });
  });

  if (!isProd) {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (isProd: ${isProd})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
