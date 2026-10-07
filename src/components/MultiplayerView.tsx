import React, { useState } from 'react';
import { Swords, Users2, Play, RotateCcw, Send, Trophy, CheckCircle, Clock, Zap, Sparkles, MessageCircle } from 'lucide-react';
import { RoomState, MultiplayerPlayer, QuickReaction } from '../hooks/useMultiplayer';
import { sounds } from '../utils/audio';

interface MultiplayerViewProps {
  room: RoomState | null;
  playerId: string;
  reactions: QuickReaction[];
  onJoinRoom: (roomId: string, name: string, avatar: string, mode: 'competitive' | 'collaborative') => void;
  onStartGame: (duration: number, reset: boolean) => void;
  onResetGame: () => void;
  onSendReaction: (emoji: string, text: string) => void;
  onLeaveRoom: () => void;
  totalStickersCount: number;
}

export const MultiplayerView: React.FC<MultiplayerViewProps> = ({
  room,
  playerId,
  reactions,
  onJoinRoom,
  onStartGame,
  onResetGame,
  onSendReaction,
  onLeaveRoom,
  totalStickersCount,
}) => {
  const [roomIdInput, setRoomIdInput] = useState('SALA-ESPANOL');
  const [nameInput, setNameInput] = useState('Estudiante');
  const [avatarInput, setAvatarInput] = useState('🎓');
  const [modeInput, setModeInput] = useState<'competitive' | 'collaborative'>('competitive');
  const [timerDurationInput, setTimerDurationInput] = useState(180);

  const avatars = ['🎓', '🐼', '🇪🇸', '🌟', '🌮', '🐉', '📖', '🚀'];

  const quickMessages = [
    { emoji: '👏', text: '¡Buen trabajo! / 太棒了！' },
    { emoji: '🔥', text: '¡En racha! / 状态火热！' },
    { emoji: '💪', text: '¡Vamos! / 加油！' },
    { emoji: '⚡', text: '¡Qué rápido! / 好快！' },
    { emoji: '💡', text: '¡Te toca! / 该你了！' },
  ];

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomIdInput.trim()) return;
    onJoinRoom(roomIdInput.trim().toUpperCase(), nameInput.trim() || 'Estudiante', avatarInput, modeInput);
    sounds.playPickSound();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!room) {
    // ROOM LOBBY FORM
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 my-4 bg-white rounded-3xl shadow-xl border border-amber-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 text-white flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-purple-500/20">
            👥
          </div>
          <h2 className="text-2xl font-bold text-slate-800 font-heading">
            Multijugador en Tiempo Real
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Compite con compañeros de clase o completad juntos un álbum compartido
          </p>
          <span className="text-xs text-indigo-700 font-medium bg-indigo-50 px-3 py-1 rounded-full inline-block mt-2">
            多人联机 · 实时对战与合作学习
          </span>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          {/* Room Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Código de Sala / 房间号
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                placeholder="Ej. CLASE-1"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                required
              />
              <button
                type="button"
                onClick={() => setRoomIdInput(`ESP-${Math.floor(100 + Math.random() * 900)}`)}
                className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Aleatorio
              </button>
            </div>
          </div>

          {/* Player Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tu Nombre / 你的名字
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Tu nombre o apodo"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Elige tu Avatar / 头像
            </label>
            <div className="flex gap-2 flex-wrap">
              {avatars.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setAvatarInput(av)}
                  className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                    avatarInput === av
                      ? 'bg-indigo-600 text-white scale-110 shadow-md ring-2 ring-indigo-400'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Game Mode Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Modo de Juego / 游戏模式
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Competitive */}
              <div
                onClick={() => setModeInput('competitive')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  modeInput === 'competitive'
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Swords className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-slate-800">Duelo Competitivo</span>
                </div>
                <p className="text-xs text-slate-600">
                  ¿Quién empareja más palabras antes de que termine el tiempo?
                </p>
                <span className="text-[11px] font-semibold text-indigo-700 block mt-1">
                  竞速对战 · 比拼积分与完成度
                </span>
              </div>

              {/* Collaborative */}
              <div
                onClick={() => setModeInput('collaborative')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  modeInput === 'collaborative'
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-slate-800">Álbum Compartido</span>
                </div>
                <p className="text-xs text-slate-600">
                  Colaborad en equipo para completar el mismo álbum juntos.
                </p>
                <span className="text-[11px] font-semibold text-emerald-700 block mt-1">
                  合作共建 · 共同点亮相册
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
          >
            Entrar a la Sala / 进入房间
          </button>
        </form>
      </div>
    );
  }

  // ACTIVE ROOM HUD
  const isHost = room.players[0]?.id === playerId;
  const myPlayer = room.players.find(p => p.id === playerId);
  const otherPlayers = room.players.filter(p => p.id !== playerId);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 mb-6 shadow-2xl border border-slate-800">
      {/* Top Banner: Room Info & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/40 border border-indigo-500/50 flex items-center justify-center text-2xl">
            {room.mode === 'competitive' ? '⚔️' : '🤝'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                Sala: {room.id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                {room.mode === 'competitive' ? 'Competición (对战)' : 'Colaborativo (合作)'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-heading">
              {room.mode === 'competitive' ? 'Carrera de Vocabulario' : 'Misión de Colección Compartida'}
            </h3>
          </div>
        </div>

        {/* Big Visible Synchronized Timer */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-inner">
            <Clock className={`w-6 h-6 ${room.timeRemaining <= 30 && room.isGameActive ? 'text-rose-500 animate-spin' : 'text-amber-400'}`} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Temporizador Visible
              </span>
              <span className={`text-2xl font-black font-mono leading-none ${room.timeRemaining <= 30 && room.isGameActive ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
                {formatTime(room.timeRemaining)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!room.isGameActive ? (
              <button
                onClick={() => onStartGame(timerDurationInput, true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm shadow-md transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Partida</span>
              </button>
            ) : (
              <button
                onClick={onResetGame}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                title="Reiniciar partida"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reiniciar</span>
              </button>
            )}

            <button
              onClick={onLeaveRoom}
              className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Players Progress Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* Current User Card */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{myPlayer?.avatar || '🎓'}</span>
              <div>
                <span className="font-bold text-white text-sm sm:text-base">{myPlayer?.name} (Tú)</span>
                <span className="text-[11px] text-indigo-400 block font-medium">Jugador local</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-amber-400 font-mono">{myPlayer?.score || 0} pts</span>
              <span className="text-[11px] text-orange-400 block">Racha: x{myPlayer?.streak || 0}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Cromos pegados: {myPlayer?.placedStickerIds.length || 0} / {totalStickersCount}</span>
              <span>{Math.round(((myPlayer?.placedStickerIds.length || 0) / (totalStickersCount || 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.round(((myPlayer?.placedStickerIds.length || 0) / (totalStickersCount || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Opponents or Teammates */}
        {otherPlayers.length > 0 ? (
          otherPlayers.map((other) => (
            <div key={other.id} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{other.avatar}</span>
                  <div>
                    <span className="font-bold text-white text-sm sm:text-base">{other.name}</span>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {room.mode === 'competitive' ? 'Rival en línea' : 'Compañero de equipo'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-amber-400 font-mono">{other.score} pts</span>
                  <span className="text-[11px] text-orange-400 block">Racha: x{other.streak}</span>
                </div>
              </div>

              {/* Opponent progress */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Cromos pegados: {other.placedStickerIds.length} / {totalStickersCount}</span>
                  <span>{Math.round((other.placedStickerIds.length / (totalStickersCount || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      room.mode === 'competitive'
                        ? 'bg-gradient-to-r from-indigo-500 to-rose-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                    style={{ width: `${Math.round((other.placedStickerIds.length / (totalStickersCount || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-1">⏳</span>
            <span className="font-bold text-slate-300 text-sm">Esperando a otro compañero...</span>
            <span className="text-xs text-slate-400 mt-1">
              Comparte el código de sala <strong className="text-amber-400 font-mono">{room.id}</strong> para que se conecte
            </span>
          </div>
        )}
      </div>

      {/* Bottom Quick Cheers and Reactions */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" /> Reacciones:
          </span>
          {quickMessages.map((m) => (
            <button
              key={m.emoji}
              onClick={() => onSendReaction(m.emoji, m.text)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-transform active:scale-90 border border-slate-700"
            >
              <span>{m.emoji}</span>
              <span className="hidden sm:inline">{m.text.split('/')[0]}</span>
            </button>
          ))}
        </div>

        {/* Live Reaction Feed banner */}
        {reactions.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/80 border border-indigo-700/60 px-3 py-1 rounded-full text-xs text-indigo-200 animate-in fade-in">
            <span className="text-sm">{reactions[0].emoji}</span>
            <span>
              <strong>{reactions[0].playerName}</strong>: {reactions[0].text}
            </span>
          </div>
        )}
      </div>

      {/* Game Finished Overlay if applicable */}
      {room.isGameFinished && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold flex items-center justify-between flex-wrap gap-2 animate-bounce">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-950" />
            <div>
              <span className="text-base block">¡Tiempo completado! / 比赛结束！</span>
              <span className="text-xs font-normal">
                {room.mode === 'competitive'
                  ? 'Revisa el marcador arriba para ver quién logró más puntos.'
                  : '¡Gran trabajo colaborando en el álbum de vocabulario!'}
              </span>
            </div>
          </div>
          <button
            onClick={() => onStartGame(timerDurationInput, true)}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black shadow-md"
          >
            Jugar otra vez
          </button>
        </div>
      )}
    </div>
  );
};
