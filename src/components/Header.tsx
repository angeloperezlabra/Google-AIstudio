import React from 'react';
import { Volume2, VolumeX, Eye, EyeOff, Trophy, Users, BookOpen, Settings, Flame, Star, Clock } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  score: number;
  streak: number;
  totalCollected: number;
  totalStickers: number;
  showPinyin: boolean;
  setShowPinyin: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  activeTab: 'album' | 'multiplayer' | 'achievements';
  setActiveTab: (tab: 'album' | 'multiplayer' | 'achievements') => void;
  onOpenAchievements: () => void;
  onOpenTeacherModal: () => void;
  timerSeconds?: number;
  isMultiplayerActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  streak,
  totalCollected,
  totalStickers,
  showPinyin,
  setShowPinyin,
  soundEnabled,
  setSoundEnabled,
  activeTab,
  setActiveTab,
  onOpenAchievements,
  onOpenTeacherModal,
  timerSeconds,
  isMultiplayerActive,
}) => {
  const percent = totalStickers > 0 ? Math.round((totalCollected / totalStickers) * 100) : 0;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playPickSound();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 text-xl font-bold">
            🇪🇸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5 font-heading">
                ¡CromoEspañol!
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold uppercase tracking-wider">
                  西语贴纸册
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Álbum interactivo de vocabulario para estudiantes universitarios
            </p>
          </div>
        </div>

        {/* Live Score, Streak and Timer pill */}
        <div className="flex items-center gap-2 sm:gap-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl px-3 py-1.5 shadow-xs">
          {/* Points */}
          <div className="flex items-center gap-1.5" title="Puntuación actual">
            <div className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-black shadow-xs">
              <Star className="w-3.5 h-3.5 fill-amber-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-amber-800 font-medium leading-none">PUNTOS / 积分</span>
              <span className="text-sm font-extrabold text-amber-950 leading-tight font-mono">{score}</span>
            </div>
          </div>

          <div className="h-6 w-px bg-amber-200" />

          {/* Streak */}
          <div className="flex items-center gap-1.5" title="Racha de aciertos consecutivos">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${streak > 0 ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500'}`}>
              <Flame className="w-3.5 h-3.5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-amber-800 font-medium leading-none">RACHA / 连对</span>
              <span className="text-sm font-extrabold text-orange-600 leading-tight font-mono">x{streak}</span>
            </div>
          </div>

          {/* Timer if present */}
          {timerSeconds !== undefined && (
            <>
              <div className="h-6 w-px bg-amber-200" />
              <div className="flex items-center gap-1.5" title="Tiempo de juego">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${timerSeconds <= 30 && timerSeconds > 0 ? 'bg-rose-500 text-white animate-bounce' : 'bg-indigo-100 text-indigo-700'}`}>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-indigo-800 font-medium leading-none">TIEMPO / 时间</span>
                  <span className={`text-sm font-extrabold leading-tight font-mono ${timerSeconds <= 30 && timerSeconds > 0 ? 'text-rose-600' : 'text-indigo-900'}`}>
                    {formatTime(timerSeconds)}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="h-6 w-px bg-amber-200 hidden md:block" />

          {/* Album percentage */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-20 bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{percent}%</span>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Solo Album Tab */}
          <button
            onClick={() => setActiveTab('album')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'album'
                ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/30'
                : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Álbum</span>
          </button>

          {/* Multiplayer Tab */}
          <button
            onClick={() => setActiveTab('multiplayer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === 'multiplayer'
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
                : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Multijugador</span>
            {isMultiplayerActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-white animate-ping" />
            )}
          </button>

          {/* Achievements Button */}
          <button
            onClick={onOpenAchievements}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'achievements'
                ? 'bg-yellow-500 text-yellow-950 shadow-xs'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
            }`}
            title="Ver logros e insignias"
          >
            <Trophy className="w-4 h-4 fill-amber-500 text-amber-700" />
            <span className="hidden sm:inline">Logros</span>
          </button>

          {/* Pinyin toggle */}
          <button
            onClick={() => setShowPinyin(!showPinyin)}
            className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1 ${
              showPinyin
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
            title={showPinyin ? 'Ocultar Pinyin (拼音)' : 'Mostrar Pinyin (拼音)'}
          >
            {showPinyin ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden md:inline font-mono">拼音</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border text-xs transition-all ${
              soundEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Teacher customizer button */}
          <button
            onClick={onOpenTeacherModal}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all"
            title="Configuración de palabras (Modo Profesor)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
